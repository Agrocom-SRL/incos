import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IBloqueCapacitacionRepository
 *
 * Bloques horarios de un curso de capacitación (tabla `capacitacion_horarios`:
 * grupo ↔ horario del catálogo `horarios`). Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IBloqueCapacitacionRepository extends IRepository {
  /**
   * Bloques vigentes de un curso (de todos sus grupos).
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(_capacitacionId, _options = {}) {
    throw new Error('Method findByCapacitacionId() must be implemented');
  }

  /**
   * Baja lógica de varios bloques a la vez.
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(_ids, _userId = null, _options = {}) {
    throw new Error('Method softDeleteByIds() must be implemented');
  }

  /**
   * Cursos vigentes que usan un horario del catálogo.
   * @param {number} horarioId
   * @returns {Promise<Array<{id: number, titulo: string}>>}
   */
  async findCursosQueUsanHorario(_horarioId) {
    throw new Error('Method findCursosQueUsanHorario() must be implemented');
  }
}
