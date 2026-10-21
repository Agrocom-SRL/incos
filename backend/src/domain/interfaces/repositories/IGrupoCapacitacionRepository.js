import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IGrupoCapacitacionRepository
 *
 * Grupos (tipo «paralelo») de un curso de capacitación (tabla
 * `capacitacion_grupos`, módulo CAP). Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IGrupoCapacitacionRepository extends IRepository {
  /**
   * Grupos vigentes de un curso, en orden de presentación.
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(_capacitacionId, _options = {}) {
    throw new Error('Method findByCapacitacionId() must be implemented');
  }

  /**
   * Baja lógica de varios grupos a la vez.
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(_ids, _userId = null, _options = {}) {
    throw new Error('Method softDeleteByIds() must be implemented');
  }

  /**
   * Grupos vigentes de un curso con `inscritosCount` (PENDIENTE + INSCRITO).
   * @param {number} capacitacionId
   * @returns {Promise<Array<Object>>}
   */
  async findConInscritosByCapacitacionId(_capacitacionId) {
    throw new Error('Method findConInscritosByCapacitacionId() must be implemented');
  }
}
