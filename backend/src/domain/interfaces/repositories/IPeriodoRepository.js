import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPeriodoRepository
 * Define el contrato que debe cumplir el repositorio de periodos académicos
 */
export class IPeriodoRepository extends IRepository {
  /**
   * Buscar periodos por carrera
   * @param {number} carreraId
   * @returns {Promise<Object[]>}
   */
  async findByCarreraId(carreraId) {
    throw new Error('Method findByCarreraId must be implemented');
  }
}
