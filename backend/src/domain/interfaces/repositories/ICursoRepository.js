import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ICursoRepository
 * Define el contrato que debe cumplir el repositorio de cursos
 */
export class ICursoRepository extends IRepository {
  /**
   * Buscar cursos por materia
   * @param {number} materiaId
   * @returns {Promise<Object[]>}
   */
  async findByMateriaId(materiaId) {
    throw new Error('Method findByMateriaId must be implemented');
  }
}
