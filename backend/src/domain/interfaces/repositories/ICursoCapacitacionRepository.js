import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICursoCapacitacionRepository
 *
 * Cursos de capacitación (tabla raíz `capacitaciones`, módulo CAP) y consultas
 * del catálogo de horarios. Los grupos y sus bloques horarios tienen
 * repositorios propios (IGrupoCapacitacionRepository / IBloqueCapacitacionRepository).
 * El aula (opcional) vive en cada grupo (`capacitacion_grupos.aula_id`).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ICursoCapacitacionRepository extends IRepository {
  /**
   * Los bloques `horarios` (tipo_horario='CLASES') con flag `ocupado`
   * calculado para un aula (choque con paralelos académicos u otros cursos
   * de capacitación en esa misma aula).
   *
   * @param {Object} params
   * @param {number} params.aulaId
   * @param {number|null} [params.excludeCursoId]
   * @returns {Promise<Array<Object>>}
   */
  async listHorariosDisponibles(_params) {
    throw new Error('Method listHorariosDisponibles() must be implemented');
  }

  /**
   * Catálogo de horarios `tipo_horario='CAPACITACION'` con `cursosEnUso`; con
   * `aulaId` calcula `ocupado`, sin aula siempre 0.
   *
   * @param {Object} [params]
   * @param {number|null} [params.aulaId]
   * @param {number|null} [params.excludeCursoId]
   * @param {string|null} [params.search]
   * @param {{campo: string, direccion: string}|null} [params.orden]
   * @returns {Promise<Array<Object>>}
   */
  async listHorariosCapacitacion(_params = {}) {
    throw new Error('Method listHorariosCapacitacion() must be implemented');
  }
}
