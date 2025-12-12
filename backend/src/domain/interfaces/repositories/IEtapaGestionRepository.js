import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEtapaGestionRepository
 * Define el contrato que debe cumplir el repositorio de etapas de gestión
 */
export class IEtapaGestionRepository extends IRepository {
  /**
   * Buscar etapas por gestión
   * @param {number} gestionId
   * @returns {Promise<Object[]>}
   */
  async findByGestionId(gestionId) {
    throw new Error('Method findByGestionId must be implemented');
  }

  /**
   * Buscar etapas vigentes
   * @returns {Promise<Object[]>}
   */
  async findVigentes() {
    throw new Error('Method findVigentes must be implemented');
  }
}
