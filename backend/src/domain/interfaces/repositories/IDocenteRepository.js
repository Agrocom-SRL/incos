import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDocenteRepository
 * Define el contrato que debe cumplir el repositorio de docentes
 */
export class IDocenteRepository extends IRepository {
  /**
   * Buscar docente por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Object|null>}
   */
  async findByCI(ci, expedicion) {
    throw new Error('Method findByCI must be implemented');
  }
}
