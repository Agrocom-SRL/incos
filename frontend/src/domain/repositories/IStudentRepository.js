/**
 * Interfaz del Repositorio de Estudiantes
 * Define el contrato que deben cumplir las implementaciones
 * 
 * Interface Segregation Principle: Interfaz específica para estudiantes
 * Dependency Inversion Principle: Dependemos de abstracción, no de implementación
 * 
 * Clean Architecture:
 * - Domain Layer: Extiende IBaseRepository con métodos específicos de estudiantes
 */

import { IBaseRepository } from './IBaseRepository.js';

export class IStudentRepository extends IBaseRepository {
  /**
   * Lista estudiantes con filtros y paginación
   * Método específico de estudiantes (puede tener lógica diferente a getAll)
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async list(params = {}) {
    throw new Error('Method list() must be implemented');
  }

  /**
   * Crea un nuevo estudiante
   * Sobrescribe el método base para permitir validationErrors
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async create(studentData) {
    throw new Error('Method create() must be implemented');
  }
}

