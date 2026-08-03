import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IDictamenProyectoRepository
 *
 * Dictámenes formales de tutoría (tabla `dictamenes_proyecto`, módulo TUT):
 * VIABILIDAD_TECNICA y DESIGNACION_OFICIAL, con PDF registrado en uploads.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IDictamenProyectoRepository extends IRepository {
  /**
   * Dictámenes vigentes de un proyecto, del más reciente al más antiguo.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(_proyectoGradoId) {
    throw new Error('Method findByProyectoGradoId() must be implemented');
  }
}
