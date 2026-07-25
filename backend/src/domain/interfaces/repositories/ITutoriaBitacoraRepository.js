import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ITutoriaBitacoraRepository
 *
 * Bitácora de reuniones/revisiones de tutoría (tabla `tutoria_bitacora`, TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ITutoriaBitacoraRepository extends IRepository {
  /**
   * Entradas vigentes de la bitácora de un proyecto, cronológicas
   * (fecha DESC, id DESC).
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(_proyectoGradoId) {
    throw new Error('Method findByProyectoGradoId() must be implemented');
  }
}
