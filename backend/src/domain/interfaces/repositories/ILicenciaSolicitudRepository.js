import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ILicenciaSolicitudRepository
 * Define el contrato que debe cumplir el repositorio de solicitudes de licencias
 */
export class ILicenciaSolicitudRepository extends IRepository {
  /**
   * Buscar licencias por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Buscar licencias por gestión
   * @param {number} gestionId
   * @returns {Promise<Object[]>}
   */
  async findByGestionId(gestionId) {
    throw new Error('Method findByGestionId must be implemented');
  }
}
