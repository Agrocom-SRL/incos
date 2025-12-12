import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ICarreraRepository
 * Define el contrato que debe cumplir el repositorio de carreras
 */
export class ICarreraRepository extends IRepository {
  /**
   * Buscar carrera por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
