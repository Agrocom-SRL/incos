import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IUsuarioRepository
 * Define el contrato que debe cumplir el repositorio de usuarios
 */
export class IUsuarioRepository extends IRepository {
  /**
   * Buscar usuario por username
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    throw new Error('Method findByUsername must be implemented');
  }

  /**
   * Buscar usuario por email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  /**
   * Buscar usuarios por rol
   * @param {number} rolId
   * @returns {Promise<Object[]>}
   */
  async findByRolId(rolId) {
    throw new Error('Method findByRolId must be implemented');
  }
}
