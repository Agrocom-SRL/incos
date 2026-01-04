import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteBecaRepository
 * Define el contrato que debe cumplir el repositorio de becas de estudiantes
 */
export class IEstudianteBecaRepository extends IRepository {
  /**
   * Buscar becas por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Buscar becas por gestión
   * @param {number} gestionId
   * @returns {Promise<Object[]>}
   */
  async findByGestionId(gestionId) {
    throw new Error('Method findByGestionId must be implemented');
  }
}

