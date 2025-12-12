import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPermisoRepository
 * Define el contrato que debe cumplir el repositorio de permisos
 */
export class IPermisoRepository extends IRepository {
  /**
   * Buscar permiso por código
   * @param {string} codigo
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo must be implemented');
  }

  /**
   * Buscar permisos por módulo
   * @param {string} modulo
   * @returns {Promise<Object[]>}
   */
  async findByModulo(modulo) {
    throw new Error('Method findByModulo must be implemented');
  }
}
