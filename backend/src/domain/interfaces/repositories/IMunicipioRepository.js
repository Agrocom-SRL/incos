import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IMunicipioRepository
 * Define el contrato que debe cumplir el repositorio de municipios
 */
export class IMunicipioRepository extends IRepository {
  /**
   * Buscar municipios por provincia
   * @param {number} provinciaId
   * @returns {Promise<Object[]>}
   */
  async findByProvinciaId(provinciaId) {
    throw new Error('Method findByProvinciaId must be implemented');
  }

  /**
   * Buscar municipio por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
