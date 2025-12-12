import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPersonalRepository
 * Define el contrato que debe cumplir el repositorio de personal
 */
export class IPersonalRepository extends IRepository {
  /**
   * Buscar personal por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Object|null>}
   */
  async findByCI(ci, expedicion) {
    throw new Error('Method findByCI must be implemented');
  }
}
