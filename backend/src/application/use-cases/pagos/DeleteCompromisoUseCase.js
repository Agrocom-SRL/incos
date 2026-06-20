import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Elimina (soft delete) un compromiso de pago por id.
 *
 * El registro se conserva como histórico (deleted_at + activo=false) y deja de
 * ser el compromiso vigente de la cabecera.
 */
export class DeleteCompromisoUseCase {
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
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const compromisoId = this._parseId(id);

    const existing = await this.compromisoPagoRepository.findById(compromisoId);
    if (!existing) {
      throw new NotFoundError(`Compromiso de pago con ID ${compromisoId}`);
    }

    const ok = await this.compromisoPagoRepository.delete(compromisoId, userId);

    this.logger?.info?.('[Pagos] Compromiso de pago eliminado', { compromisoId, ok });

    return ok;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de compromiso inválido');
    }
    return id;
  }
}
