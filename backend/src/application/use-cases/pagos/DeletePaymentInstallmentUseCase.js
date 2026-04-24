import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_PAGO_APORTE } from '../../../domain/constants/pagos.constants.js';

/**
 * Soft delete de una cuota (pago_cuotas) y recalcula el estado de la cabecera (pago_aporte).
 */
export class DeletePaymentInstallmentUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ContributionPaymentInstallmentRepository.js').ContributionPaymentInstallmentRepository} deps.contributionPaymentInstallmentRepository
   * @param {import('../../../infrastructure/repositories/ContributionPaymentRepository.js').ContributionPaymentRepository} deps.contributionPaymentRepository
   * @param {Object} deps.logger
   */
  constructor({ contributionPaymentInstallmentRepository, contributionPaymentRepository, logger }) {
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} cuotaId - pago_cuotas.id
   */
  async execute(cuotaId) {
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

    const deleted = await this.contributionPaymentInstallmentRepository.delete(cuotaId);
    if (!deleted) {
      throw new NotFoundError(`Cuota de pago con ID ${cuotaId}`);
    }

    const nuevoTotal = await this._sumMontosActivos(cabeceraId);
    let nuevoEstado = ESTADOS_PAGO_APORTE.PENDIENTE;
    if (nuevoTotal >= montoObligatorio - 1e-6) {
      nuevoEstado = ESTADOS_PAGO_APORTE.CANCELADO;
    } else if (nuevoTotal > 0) {
      nuevoEstado = ESTADOS_PAGO_APORTE.PARCIAL;
    }
    await this.contributionPaymentRepository.update(cabeceraId, { state: nuevoEstado });

    this.logger.info('[Pagos] Cuota de aporte eliminada', { cuotaId, cabeceraId, nuevoEstado, nuevoTotal });
  }

  async _sumMontosActivos(cabeceraId) {
    const result = await this.contributionPaymentInstallmentRepository.findAll(
      { contributionPaymentId: cabeceraId },
      null,
      { limit: 5000 }
    );
    const list = result.contributionPaymentInstallments || result.contributionPaymentInstallment || [];
    let sum = 0;
    for (const c of list) {
      const p = c.toPlainObject ? c.toPlainObject() : c;
      sum += Number(p.amount ?? p.monto ?? 0) || 0;
    }
    return sum;
  }
}
