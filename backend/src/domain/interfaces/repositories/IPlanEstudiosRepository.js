import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPlanEstudiosRepository
 * Define el contrato que debe cumplir el repositorio de plan de estudios
 */
export class IPlanEstudiosRepository extends IRepository {
  /**
   * Buscar plan de estudios por carrera
   * @param {number} carreraId
   * @returns {Promise<Object[]>}
   */
  async findByCarreraId(carreraId) {
    throw new Error('Method findByCarreraId must be implemented');
  }

  /**
   * Buscar plan de estudios por periodo
   * @param {number} periodoId
   * @returns {Promise<Object[]>}
   */
  async findByPeriodoId(periodoId) {
    throw new Error('Method findByPeriodoId must be implemented');
  }
}
