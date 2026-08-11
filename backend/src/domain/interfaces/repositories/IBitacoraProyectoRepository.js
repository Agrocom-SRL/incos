import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IBitacoraProyectoRepository
 *
 * Bitácora de reuniones/revisiones de tutoría (tabla `bitacora_proyecto`, TUT).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IBitacoraProyectoRepository extends IRepository {
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

  /**
   * Máximo `porcentaje_avance` histórico registrado para el proyecto (piso
   * para no permitir que una nueva entrada retroceda el avance del proyecto).
   *
   * @param {number} _proyectoGradoId
   * @returns {Promise<number>} 0 si el proyecto aún no tiene ningún % registrado.
   */
  async findMaxPorcentajeAvance(_proyectoGradoId) {
    throw new Error('Method findMaxPorcentajeAvance() must be implemented');
  }
}
