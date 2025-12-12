import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IRolRepository
 * Define el contrato que debe cumplir el repositorio de roles
 */
export class IRolRepository extends IRepository {
  /**
   * Buscar rol por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
