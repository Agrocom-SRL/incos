import { NotFoundError } from '../../../../domain/errors/AppError.js';

/**
 * Use Case: DeleteSesionRefuerzoUseCase (A8)
 * Módulo: Académico (ACA · acompañamiento)
 *
 * Elimina (soft delete) una sesión de refuerzo.
 */
export class DeleteSesionRefuerzoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionRefuerzoRepository
   * @param {ILogger} params.logger
   */
  constructor({ sesionRefuerzoRepository, logger }) {
    this.sesionRefuerzoRepository = sesionRefuerzoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const sesion = await this.sesionRefuerzoRepository.findById(id);
    if (!sesion) {
      throw new NotFoundError(`sesión de refuerzo con ID ${id}`);
    }
    const deleted = await this.sesionRefuerzoRepository.delete(id, userId);
    this.logger.info('[Acompañamiento] Sesión de refuerzo eliminada (soft)', { id });
    return deleted;
  }
}
