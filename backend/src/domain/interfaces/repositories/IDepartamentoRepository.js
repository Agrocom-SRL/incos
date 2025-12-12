import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDepartamentoRepository
 * Define el contrato que debe cumplir el repositorio de departamentos
 */
export class IDepartamentoRepository extends IRepository {
  /**
   * Buscar departamentos por país
   * @param {number} paisId
   * @returns {Promise<Object[]>}
   */
  async findByPaisId(paisId) {
    throw new Error('Method findByPaisId must be implemented');
  }

  /**
   * Buscar departamento por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
