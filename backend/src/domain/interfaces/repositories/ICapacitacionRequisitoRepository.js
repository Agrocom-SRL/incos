import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICapacitacionRequisitoRepository
 *
 * Requisitos de inscripción configurables por curso de capacitación (tabla
 * `capacitacion_requisitos`, módulo CAP).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ICapacitacionRequisitoRepository extends IRepository {
  /**
   * Requisitos vigentes de un curso, en orden de presentación.
   *
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(_capacitacionId, _options = {}) {
    throw new Error('Method findByCapacitacionId() must be implemented');
  }

  /**
   * Baja lógica de varios requisitos a la vez.
   *
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(_ids, _userId = null, _options = {}) {
    throw new Error('Method softDeleteByIds() must be implemented');
  }
}
