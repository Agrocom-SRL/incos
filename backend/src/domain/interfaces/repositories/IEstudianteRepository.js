import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteRepository
 * Define el contrato que debe cumplir el repositorio de estudiantes
 * Extiende IRepository para métodos comunes
 */
export class IEstudianteRepository extends IRepository {
  /**
   * Buscar estudiante por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Student|null>}
   */
  async findByCI(ci, expedicion) {
    throw new Error('Method findByCI must be implemented');
  }

  /**
   * Buscar estudiante por código
   * @param {string} codigoEstudiante
   * @returns {Promise<Student|null>}
   */
  async findByCodigo(codigoEstudiante) {
    throw new Error('Method findByCodigo must be implemented');
  }

  /**
   * Buscar estudiante por email
   * @param {string} email
   * @returns {Promise<Student|null>}
   */
  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  /**
   * Obtiene el siguiente número para generar código de estudiante
   * @param {string} gestionCodigo - Código de la gestión (ej: "2025-1")
   * @returns {Promise<number>}
   */
  async getNextStudentNumber(gestionCodigo) {
    throw new Error('Method getNextStudentNumber must be implemented');
  }
}

