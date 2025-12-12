import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPaisRepository
 * Define el contrato que debe cumplir el repositorio de países
 */
export class IPaisRepository extends IRepository {
  /**
   * Buscar país por código ISO
   * @param {string} codigoIso
   * @returns {Promise<Object|null>}
   */
  async findByCodigoIso(codigoIso) {
    throw new Error('Method findByCodigoIso must be implemented');
  }
}
