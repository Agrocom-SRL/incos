import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

const ESTADOS_VALIDOS = ['VIGENTE', 'CUMPLIDO', 'INCUMPLIDO'];

/**
 * Edita un compromiso de pago existente por id.
 *
 * Permite ajustar fecha, observación y estado (p.ej. marcar CUMPLIDO /
 * INCUMPLIDO). No re-valida la unicidad VIGENTE: editar un compromiso ya creado
 * no introduce un segundo VIGENTE para la misma cabecera (el upsert es quien
 * gestiona el reemplazo). Si se quisiera reactivar a VIGENTE, ese flujo es el
 * upsert (POST), no la edición.
 */
export class UpdateCompromisoUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/ICompromisoPagoRepository.js').ICompromisoPagoRepository} params.compromisoPagoRepository
   * @param {Object} params.logger
   */
  constructor({ compromisoPagoRepository, logger }) {
    this.compromisoPagoRepository = compromisoPagoRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id - id del compromiso
   * @param {Object} data - { fechaCompromiso?, observacion?, estado? }
   * @param {number|null} userId
   * @returns {Promise<Object>} compromiso actualizado
   */
  async execute(id, data, userId = null) {
    const compromisoId = this._parseId(id);

    const existing = await this.compromisoPagoRepository.findById(compromisoId);
    if (!existing) {
      throw new NotFoundError(`Compromiso de pago con ID ${compromisoId}`);
    }

    const payload = {};

    if (data?.fechaCompromiso !== undefined) {
      payload.fechaCompromiso = this._validateFecha(data.fechaCompromiso);
    }
    if (data?.observacion !== undefined) {
      payload.observacion = this._normalizeObservacion(data.observacion);
    }
    if (data?.estado !== undefined) {
      payload.estado = this._validateEstado(data.estado);
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    const updated = await this.compromisoPagoRepository.update(compromisoId, payload, userId);

    this.logger?.info?.('[Pagos] Compromiso de pago actualizado', {
      compromisoId,
      campos: Object.keys(payload),
    });

    return updated;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de compromiso inválido');
    }
    return id;
  }

  _validateFecha(value) {
    if (value == null || value === '') {
      throw new ValidationError('fecha_compromiso no puede ser vacía');
    }
    const str = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      throw new ValidationError('fecha_compromiso debe tener formato YYYY-MM-DD');
    }
    const parsed = new Date(`${str}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError('fecha_compromiso no es una fecha válida');
    }
    return str;
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

  _validateEstado(value) {
    const estado = String(value).trim().toUpperCase();
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new ValidationError(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    return estado;
  }
}
