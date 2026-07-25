import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ITutoriaAvanceRepository
 *
 * Archivos de avance del proyecto de grado (tabla `tutoria_avances`, TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ITutoriaAvanceRepository extends IRepository {
  /**
   * Avances vigentes de un proyecto, del más reciente al más antiguo.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findByProyectoGradoId(_proyectoGradoId) {
    throw new Error('Method findByProyectoGradoId() must be implemented');
  }

  /**
   * Máximo numero_avance registrado en el proyecto (0 si no hay avances).
   * Para asignar el correlativo del siguiente avance.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<number>}
   */
  async findMaxNumeroAvance(_proyectoGradoId) {
    throw new Error('Method findMaxNumeroAvance() must be implemented');
  }
}
