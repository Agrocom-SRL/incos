import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IMateriaRepository
 * Define el contrato que debe cumplir el repositorio de materias
 */
export class IMateriaRepository extends IRepository {
  /**
   * Buscar materia por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
