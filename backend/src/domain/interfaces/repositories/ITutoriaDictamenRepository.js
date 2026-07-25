import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ITutoriaDictamenRepository
 *
 * Dictámenes formales de tutoría (tabla `tutoria_dictamenes`, módulo TUT):
 * VIABILIDAD_TECNICA y DESIGNACION_OFICIAL, con PDF registrado en uploads.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ITutoriaDictamenRepository extends IRepository {
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
