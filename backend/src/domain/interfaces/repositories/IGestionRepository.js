import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IGestionRepository
 * Define el contrato que debe cumplir el repositorio de gestiones académicas
 */
export class IGestionRepository extends IRepository {
  /**
   * Buscar gestión por código (ej: "2025-1")
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }

  /**
   * Buscar gestiones por año
   * @param {number} anio
   * @returns {Promise<Object[]>}
   */
  async findByAnio(anio) {
    throw new Error('Method findByAnio must be implemented');
  }

  /**
   * Buscar gestión activa actual
   * @returns {Promise<Object|null>}
   */
  async findActive() {
    throw new Error('Method findActive must be implemented');
  }
}
