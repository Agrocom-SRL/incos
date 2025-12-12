import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IProvinciaRepository
 * Define el contrato que debe cumplir el repositorio de provincias
 */
export class IProvinciaRepository extends IRepository {
  /**
   * Buscar provincias por departamento
   * @param {number} departamentoId
   * @returns {Promise<Object[]>}
   */
  async findByDepartamentoId(departamentoId) {
    throw new Error('Method findByDepartamentoId must be implemented');
  }

  /**
   * Buscar provincia por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }
}
