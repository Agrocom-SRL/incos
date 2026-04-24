import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_PAGO_APORTE } from '../../../domain/constants/pagos.constants.js';

/**
 * Actualiza una cuota (pago_cuotas) existente y recalcula el estado de la cabecera (pago_aporte).
 * No altera numero_recibo (sigue alineado al id impreso en boleta).
 */
export class UpdatePaymentInstallmentUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ContributionPaymentInstallmentRepository.js').ContributionPaymentInstallmentRepository} deps.contributionPaymentInstallmentRepository
   * @param {import('../../../infrastructure/repositories/ContributionPaymentRepository.js').ContributionPaymentRepository} deps.contributionPaymentRepository
   * @param {import('../../../infrastructure/repositories/PaymentMethodRepository.js').PaymentMethodRepository} deps.paymentMethodRepository
   * @param {Object} deps.logger
   */
  constructor({
    contributionPaymentInstallmentRepository,
    contributionPaymentRepository,
    paymentMethodRepository,
    logger,
  }) {
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.logger = logger;
  }

  /**
   * @param {number} cuotaId
   * @param {Object} data - snake_case o camelCase (amount, payment_date, payment_method_id, …)
   */
  async execute(cuotaId, data) {
    if (!cuotaId || Number.isNaN(Number(cuotaId))) {
      throw new ValidationError('ID de cuota inválido');
    }

    const installment = await this.contributionPaymentInstallmentRepository.findById(cuotaId);
    if (!installment) {
      throw new NotFoundError(`Cuota de pago con ID ${cuotaId}`);
    }

    const plain = installment.toPlainObject ? installment.toPlainObject() : installment;
    if (plain.deletedAt != null || plain.deleted_at != null) {
      throw new ValidationError('La cuota indicada no está disponible');
    }

    const cabeceraId = plain.contributionPaymentId ?? plain.pagoAporteId;
    const cabecera = await this.contributionPaymentRepository.findById(cabeceraId);
    if (!cabecera) {
      throw new NotFoundError(`Cabecera de aporte con ID ${cabeceraId}`);
    }
    const cabPlain = cabecera.toPlainObject ? cabecera.toPlainObject() : cabecera;
    const montoObligatorio = Number(cabPlain.mandatoryAmount ?? cabPlain.montoObligatorio ?? 0);

    const oldAmount = Number(plain.amount ?? plain.monto ?? 0);
    const amount =
      data.amount !== undefined && data.amount !== null
        ? Number(data.amount)
        : data.monto !== undefined && data.monto !== null
          ? Number(data.monto)
          : oldAmount;

    if (Number.isNaN(amount) || amount < 0) {
      throw new ValidationError('El monto de la cuota no es válido');
    }

    const paymentMethodId =
      data.payment_method_id ?? data.paymentMethodId ?? plain.paymentMethodId ?? plain.metodoPagoId;
    const paymentAccountId =
      data.payment_account_id !== undefined
        ? data.payment_account_id ?? data.paymentAccountId
        : data.paymentAccountId !== undefined
          ? data.paymentAccountId
          : plain.paymentAccountId ?? plain.cuentaPagoId ?? null;

    const paymentDateRaw = data.payment_date ?? data.paymentDate ?? plain.paymentDate ?? plain.fechaPago;
    const paymentDate =
      typeof paymentDateRaw === 'string'
        ? paymentDateRaw.slice(0, 10)
        : paymentDateRaw instanceof Date
          ? paymentDateRaw.toISOString().slice(0, 10)
          : plain.paymentDate ?? plain.fechaPago;

    if (!paymentDate) {
      throw new ValidationError('La fecha de pago es requerida');
    }

    const transactionNumber =
      data.transaction_number !== undefined
        ? data.transaction_number ?? data.transactionNumber
        : data.transactionNumber !== undefined
          ? data.transactionNumber
          : plain.transactionNumber ?? plain.numeroTransaccion ?? null;

    const codigoComprobante =
      data.codigo_comprobante !== undefined
        ? data.codigo_comprobante ?? data.codigoComprobante
        : data.codigoComprobante !== undefined
          ? data.codigoComprobante
          : plain.comprobanteCode ?? plain.codigoComprobante ?? null;

    const descripcion =
      data.descripcion !== undefined
        ? data.descripcion ?? data.description
        : data.description !== undefined
          ? data.description
          : plain.description ?? plain.descripcion ?? null;

    const totalOtros = await this._sumOtrosMontos(cabeceraId, cuotaId);
    if (totalOtros + amount > montoObligatorio + 1e-6) {
      throw new ValidationError(
        `El monto actualizado deja un total pagado (Bs. ${(totalOtros + amount).toFixed(2)}) ` +
          `superior al monto obligatorio (Bs. ${montoObligatorio.toFixed(2)})`
      );
    }

    const esPagoGratuito = amount === 0;
    const esMetodoEfectivo = Number(paymentMethodId) === 1;
    let finalMethodId = Number(paymentMethodId);
    let finalAccountId = paymentAccountId != null ? Number(paymentAccountId) : null;
    let finalTx = transactionNumber != null ? String(transactionNumber).trim() || null : null;
    let finalCodigo = codigoComprobante != null ? String(codigoComprobante).trim() || null : null;

    if (esPagoGratuito && esMetodoEfectivo) {
      finalMethodId = 1;
      finalAccountId = null;
      finalTx = null;
      finalCodigo = null;
    } else {
      await this._validatePaymentMethod(finalMethodId, finalAccountId, finalTx, finalCodigo);
    }

    const updatePayload = {
      paymentDate,
      amount,
      paymentMethodId: finalMethodId,
      paymentAccountId: finalAccountId,
      transactionNumber: finalTx,
      comprobanteCode: finalCodigo,
      description: descripcion != null ? String(descripcion).trim() || null : null,
    };

    const updated = await this.contributionPaymentInstallmentRepository.update(cuotaId, updatePayload);

    const nuevoTotal = totalOtros + amount;
    let nuevoEstado = ESTADOS_PAGO_APORTE.PENDIENTE;
    if (nuevoTotal >= montoObligatorio - 1e-6) {
      nuevoEstado = ESTADOS_PAGO_APORTE.CANCELADO;
    } else if (nuevoTotal > 0) {
      nuevoEstado = ESTADOS_PAGO_APORTE.PARCIAL;
    }
    await this.contributionPaymentRepository.update(cabeceraId, { state: nuevoEstado });

    this.logger.info('[Pagos] Cuota de aporte actualizada', { cuotaId, cabeceraId, nuevoEstado, nuevoTotal });

    const out = updated?.toPlainObject ? updated.toPlainObject() : updated;
    return out;
  }

  async _sumOtrosMontos(cabeceraId, excludeCuotaId) {
    const result = await this.contributionPaymentInstallmentRepository.findAll(
      { contributionPaymentId: cabeceraId },
      null,
      { limit: 5000 }
    );
    const list = result.contributionPaymentInstallments || result.contributionPaymentInstallment || [];
    let sum = 0;
    for (const c of list) {
      const p = c.toPlainObject ? c.toPlainObject() : c;
      const id = p.id;
      if (id === excludeCuotaId) continue;
      sum += Number(p.amount ?? p.monto ?? 0) || 0;
    }
    return sum;
  }

  async _validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber, codigoComprobante) {
    const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
    if (!paymentMethod) {
      throw new NotFoundError(`Método de pago con ID ${paymentMethodId}`);
    }
    const plain = paymentMethod.toPlainObject ? paymentMethod.toPlainObject() : paymentMethod;
    const nombre = plain.name ?? plain.nombre ?? 'Método';

    if (paymentMethodId === 1) {
      if (paymentAccountId) {
        throw new ValidationError('El método EFECTIVO no debe tener cuenta de pago asociada');
      }
    } else if (paymentMethodId === 2) {
      if (!codigoComprobante) {
        throw new ValidationError(`El método ${nombre} requiere un código de comprobante`);
      }
    } else if (paymentMethodId === 3 || paymentMethodId === 4) {
      if (!paymentAccountId) {
        throw new ValidationError(`El método ${nombre} requiere una cuenta de pago`);
      }
      if (!codigoComprobante) {
        throw new ValidationError(`El método ${nombre} requiere un código de comprobante`);
      }
    } else {
      throw new ValidationError('Método de pago no soportado para edición');
    }
    return paymentMethod;
  }
}
