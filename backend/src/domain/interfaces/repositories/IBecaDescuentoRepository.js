import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IBecaDescuentoRepository
 * Define el contrato que debe cumplir el repositorio de becas y descuentos
 */
export class IBecaDescuentoRepository extends IRepository {
  /**
   * Buscar beca por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }

  /**
   * Buscar beca por porcentaje
   * @param {number} porcentaje
   * @returns {Promise<Object|null>}
   */
  async findByPorcentaje(porcentaje) {
    throw new Error('Method findByPorcentaje must be implemented');
  }

  /**
   * Buscar becas automáticas
   * @returns {Promise<Object[]>}
   */
  async findAutomaticas() {
    throw new Error('Method findAutomaticas must be implemented');
  }
}
