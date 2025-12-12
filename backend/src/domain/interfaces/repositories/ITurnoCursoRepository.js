import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ITurnoCursoRepository
 * Define el contrato que debe cumplir el repositorio de turnos de cursos
 */
export class ITurnoCursoRepository extends IRepository {
  /**
   * Buscar turnos por asignación
   * @param {number} asignacionId
   * @returns {Promise<Object[]>}
   */
  async findByAsignacionId(asignacionId) {
    throw new Error('Method findByAsignacionId must be implemented');
  }
}
