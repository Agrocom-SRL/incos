import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteDatosAcademicosRepository
 * Define el contrato que debe cumplir el repositorio de datos académicos de estudiantes
 */
export class IEstudianteDatosAcademicosRepository extends IRepository {
  /**
   * Buscar datos académicos por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Buscar estudiantes por carrera
   * @param {number} carreraId
   * @returns {Promise<Object[]>}
   */
  async findByCarreraId(carreraId) {
    throw new Error('Method findByCarreraId must be implemented');
  }
}

