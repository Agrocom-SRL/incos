import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ISesionRepository
 * Define el contrato que debe cumplir el repositorio de sesiones
 */
export class ISesionRepository extends IRepository {
  /**
   * Buscar sesión por token
   * @param {string} tokenSesion
   * @returns {Promise<Object|null>}
   */
  async findByToken(tokenSesion) {
    throw new Error('Method findByToken must be implemented');
  }

  /**
   * Buscar sesiones por usuario
   * @param {number} usuarioId
   * @returns {Promise<Object[]>}
   */
  async findByUsuarioId(usuarioId) {
    throw new Error('Method findByUsuarioId must be implemented');
  }
}
