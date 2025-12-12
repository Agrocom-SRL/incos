import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IAsignacionDocenteRepository
 * Define el contrato que debe cumplir el repositorio de asignaciones de docentes
 */
export class IAsignacionDocenteRepository extends IRepository {
  /**
   * Buscar asignaciones por docente
   * @param {number} docenteId
   * @returns {Promise<Object[]>}
   */
  async findByDocenteId(docenteId) {
    throw new Error('Method findByDocenteId must be implemented');
  }

  /**
   * Buscar asignaciones por gestión
   * @param {number} gestionId
   * @returns {Promise<Object[]>}
   */
  async findByGestionId(gestionId) {
    throw new Error('Method findByGestionId must be implemented');
  }
}
