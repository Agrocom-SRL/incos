import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeleteSesionReforzamientoUseCase (A8)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Elimina (soft delete) una sesión de reforzamiento.
 */
export class DeleteSesionReforzamientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionReforzamientoRepository
   * @param {ILogger} params.logger
   */
  constructor({ sesionReforzamientoRepository, logger }) {
    this.sesionReforzamientoRepository = sesionReforzamientoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    const sesion = await this.sesionReforzamientoRepository.findById(id);
    if (!sesion) {
      throw new NotFoundError(`sesión de reforzamiento con ID ${id}`);
    }
    const deleted = await this.sesionReforzamientoRepository.delete(id, userId);
    this.logger.info('[Tutorías] Sesión de reforzamiento eliminada (soft)', { id });
    return deleted;
  }
}
