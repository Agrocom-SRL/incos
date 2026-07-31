import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: DeleteProyectoGradoUseCase (T9)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Elimina (soft delete) el proyecto de grado. Los satélites conservan su
 * historial (soft delete solo de la raíz; las vistas 159/160 filtran por
 * proyecto activo/no borrado).
 */
export class DeleteProyectoGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  async execute(id, userId = null) {
    await getProyectoOrFail(this.proyectoGradoRepository, id);
    const deleted = await this.proyectoGradoRepository.delete(id, userId);
    this.logger.info('[Tutorías] Proyecto de grado eliminado (soft)', { id });
    return deleted;
  }
}
