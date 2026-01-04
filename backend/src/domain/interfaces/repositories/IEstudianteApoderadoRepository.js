import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteApoderadoRepository
 * Define el contrato que debe cumplir el repositorio de apoderados de estudiantes
 */
export class IEstudianteApoderadoRepository extends IRepository {
  /**
   * Buscar apoderados por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }
}

