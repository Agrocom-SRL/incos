import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { parseFechaISO } from '../../utils/validacionEntrada.js';

/**
 * Crea (o reemplaza) el compromiso de pago VIGENTE de una cabecera de aporte.
 *
 * Regla de negocio: UN compromiso VIGENTE por cabecera (pago_aporte).
 *
 * DECISIÓN (documentada): si ya existe un compromiso VIGENTE para la cabecera, se
 * SOFT-ANULA el anterior (soft delete + activo=false, conservando su estado
 * VIGENTE como histórico de renegociación) y se crea uno NUEVO. Así la planilla
 * siempre lee el compromiso vigente actual y se conserva el rastro de cambios.
 * No se reutiliza el registro previo para no perder fecha/observación originales.
 */
export class UpsertCompromisoUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/ICompromisoPagoRepository.js').ICompromisoPagoRepository} params.compromisoPagoRepository
   * @param {import('../../../domain/interfaces/repositories/IRepository.js').IRepository} params.contributionPaymentRepository
   * @param {Object} params.logger
   */
  constructor({ compromisoPagoRepository, contributionPaymentRepository, logger }) {
    this.compromisoPagoRepository = compromisoPagoRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number} params.pagoAporteId
   * @param {Object} params.data - { fechaCompromiso (req), observacion? }
   * @param {number|null} params.userId
   * @returns {Promise<Object>} compromiso vigente creado
   */
  async execute({ pagoAporteId: raw, data, userId = null }) {
    const pagoAporteId = this._parseId(raw);
    const fechaCompromiso = this._validateFecha(data?.fechaCompromiso);
    const observacion = this._normalizeObservacion(data?.observacion);

    // La cabecera debe existir.
    const cabecera = await this.contributionPaymentRepository.findById(pagoAporteId);
    if (!cabecera) {
      throw new NotFoundError(`Cabecera de aporte con ID ${pagoAporteId}`);
    }

    // Soft-anular el compromiso vigente previo (si lo hay) para mantener histórico.
    const vigente = await this.compromisoPagoRepository.findVigenteByPagoAporteId(pagoAporteId);
    if (vigente) {
      await this.compromisoPagoRepository.delete(vigente.id, userId);
      this.logger?.info?.('[Pagos] Compromiso vigente anterior anulado (renegociación)', {
        pagoAporteId,
        compromisoAnteriorId: vigente.id,
      });
    }

    const creado = await this.compromisoPagoRepository.create(
      {
        pagoAporteId,
        fechaCompromiso,
        observacion,
        estado: 'VIGENTE',
      },
      userId
    );

    this.logger?.info?.('[Pagos] Compromiso de pago creado', {
      pagoAporteId,
      compromisoId: creado?.id,
      reemplazo: Boolean(vigente),
    });

    return creado;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('pagoAporteId inválido');
    }
    return id;
  }

  _validateFecha(value) {
    if (value == null || value === '') {
      throw new ValidationError('fecha_compromiso es requerida');
    }
    // Acepta 'YYYY-MM-DD' (DATEONLY).
    return parseFechaISO(value, 'fecha_compromiso');
  }

  _normalizeObservacion(value) {
    if (value == null) return null;
    const str = String(value).trim();
    if (str === '') return null;
    if (str.length > 500) {
      throw new ValidationError('observacion no puede superar 500 caracteres');
    }
    return str;
  }
}
