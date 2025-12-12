import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IRolPermisoRepository
 * Define el contrato que debe cumplir el repositorio de roles-permisos
 */
export class IRolPermisoRepository extends IRepository {
  /**
   * Buscar permisos por rol
   * @param {number} rolId
   * @returns {Promise<Object[]>}
   */
  async findByRolId(rolId) {
    throw new Error('Method findByRolId must be implemented');
  }

  /**
   * Buscar roles por permiso
   * @param {number} permisoId
   * @returns {Promise<Object[]>}
   */
  async findByPermisoId(permisoId) {
    throw new Error('Method findByPermisoId must be implemented');
  }
}
