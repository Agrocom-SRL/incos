/**
 * Use Case: GetMiAporteDetalleEstudianteUseCase
 * Módulo: Pagos (Portal del estudiante)
 *
 * Detalle de UN aporte (cabecera pago_aporte) del estudiante de la SESIÓN, incluido
 * el array de CUOTAS pagadas (abonos en pago_cuotas). El estudiante se resuelve en
 * servidor desde req.usuario.id y se verifica que la cabecera le pertenezca (anti-IDOR).
 *
 * Reutiliza GetPaymentAporteByIdUseCase (mismo detalle enriquecido que el admin) SIN
 * modificarlo, y añade las cuotas leídas de ContributionPaymentInstallmentRepository
 * (misma fuente que el formulario de registro). NO expone recibo/comprobante (ni
 * enlace ni binario): solo metadatos de cada pago.
 *
 * Clean Architecture / SOLID: Application Layer; una sola responsabilidad.
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class GetMiAporteDetalleEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getPaymentAporteByIdUseCase - Detalle enriquecido (reuso)
   * @param {Object} params.contributionPaymentInstallmentRepository - Cuotas (pago_cuotas)
   * @param {Object} params.paymentMethodRepository - Nombres de método de pago
   * @param {Object} params.studentRepository - Resolución de estudiante por usuario
   * @param {Object} params.userRepository - Fallback de referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({
    getPaymentAporteByIdUseCase,
    contributionPaymentInstallmentRepository,
    paymentMethodRepository,
    studentRepository,
    userRepository,
    logger,
  }) {
    if (!getPaymentAporteByIdUseCase) {
      throw new Error('getPaymentAporteByIdUseCase es requerido');
    }
    if (!contributionPaymentInstallmentRepository) {
      throw new Error('contributionPaymentInstallmentRepository es requerido');
    }
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.getPaymentAporteByIdUseCase = getPaymentAporteByIdUseCase;
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, cabeceraId: number }} input
   */
  async execute({ usuarioId, cabeceraId }) {
    const id = Number(cabeceraId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Aporte');
    }

    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const detalle = await this.getPaymentAporteByIdUseCase.execute(id);

    // Verificar pertenencia: la cabecera debe ser del estudiante resuelto.
    const ownerId = Number(detalle?.student_id ?? detalle?.estudiante?.id);
    if (!Number.isFinite(ownerId) || ownerId !== estudianteId) {
      throw new NotFoundError('Aporte');
    }

    const cuotas = await this._fetchCuotas(id);

    // No exponer recibo/comprobante (ni enlace ni binario).
    const payload = { ...detalle };
    delete payload.reciboDocumento;

    this.logger.info('[Pagos] Mi aporte detalle obtenido', {
      usuarioId,
      estudianteId,
      cabeceraId: id,
      cuotas: cuotas.length,
    });

    return { ...payload, cuotas };
  }

  /**
   * Lee y mapea las cuotas (abonos) de la cabecera, ordenadas cronológicamente y
   * numeradas 1..n. Resuelve el nombre del método de pago sin N+1.
   * @private
   */
  async _fetchCuotas(cabeceraId) {
    const result = await this.contributionPaymentInstallmentRepository.findAll(
      { contributionPaymentId: cabeceraId },
      1,
      5000
    );
    const list =
      result?.contributionPaymentInstallments ||
      result?.contributionPaymentInstallment ||
      [];

    const plains = list.map((c) => (c.toPlainObject ? c.toPlainObject() : c));

    // Orden cronológico (fecha de pago, luego id) para numerar las cuotas.
    plains.sort((a, b) => {
      const fa = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const fb = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      if (fa !== fb) return fa - fb;
      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });

    const metodoMap = await this._buildMetodoPagoMap(plains);

    return plains.map((p, idx) => {
      const metodoPagoId = p.paymentMethodId ?? null;
      return {
        id: p.id,
        numero: idx + 1,
        monto: Number(p.amount ?? 0) || 0,
        fechaPago: p.paymentDate ?? null,
        metodoPago: metodoPagoId != null ? metodoMap[metodoPagoId] ?? null : null,
        numeroRecibo: (p.receiptNumber ?? '').toString().trim() || null,
        nroComprobante: (p.comprobanteCode ?? '').toString().trim() || null,
        // pago_cuotas no tiene estado por cuota: cada cuota es un abono efectuado.
        estado: 'PAGADO',
      };
    });
  }

  /**
   * Mapa { paymentMethodId: nombre } resolviendo solo los ids presentes (sin N+1).
   * @private
   */
  async _buildMetodoPagoMap(plains) {
    const map = {};
    if (!this.paymentMethodRepository) return map;
    const ids = [
      ...new Set(plains.map((p) => p.paymentMethodId).filter((v) => v != null)),
    ];
    await Promise.all(
      ids.map(async (mid) => {
        try {
          const method = await this.paymentMethodRepository.findById(mid);
          const plain = method?.toPlainObject ? method.toPlainObject() : method;
          map[mid] = plain ? (plain.name ?? plain.nombre ?? null) : null;
        } catch {
          map[mid] = null;
        }
      })
    );
    return map;
  }
}

export default GetMiAporteDetalleEstudianteUseCase;
