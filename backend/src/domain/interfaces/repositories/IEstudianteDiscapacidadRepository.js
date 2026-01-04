import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteDiscapacidadRepository
 * Define el contrato que debe cumplir el repositorio de discapacidades de estudiantes
 * Extiende IRepository para métodos comunes
 */
export class IEstudianteDiscapacidadRepository extends IRepository {
  /**
   * Buscar discapacidades por estudiante
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentDisability[]>}
   */
  async findByEstudianteId(estudianteId) {
    throw new Error('Method findByEstudianteId must be implemented');
  }

  /**
   * Crear múltiples discapacidades para un estudiante
   * @param {number} estudianteId - ID del estudiante
   * @param {Array<{disabilityTypeId: number, description?: string, disabilityDegree?: string, cause?: string}>} discapacidades - Array de discapacidades
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<StudentDisability[]>}
   */
  async createMultiple(estudianteId, discapacidades, userId = null) {
    throw new Error('Method createMultiple must be implemented');
  }

  /**
   * Eliminar todas las discapacidades de un estudiante (soft delete)
   * @param {number} estudianteId - ID del estudiante
   * @param {number} userId - ID del usuario que elimina
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteByEstudianteId(estudianteId, userId = null) {
    throw new Error('Method deleteByEstudianteId must be implemented');
  }
}

