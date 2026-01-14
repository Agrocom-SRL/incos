/**
 * Use Case: Obtener Inscripción por ID
 * 
 * Single Responsibility: Orquestar la obtención de una inscripción por su ID
 * Dependency Inversion: Depende de la abstracción IInscripcionRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Obtener una inscripción por ID con todas sus materias relacionadas
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IInscripcionRepository } from '@repositories/IInscripcionRepository';

export class ObtenerInscripcionPorIdUseCase {
  /**
   * @param {IInscripcionRepository} inscripcionRepository - Repositorio de inscripciones
   */
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener una inscripción por ID
   * 
   * @param {string|number} id - ID de la inscripción
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID de la inscripción es requerido',
        };
      }

      // El repositorio hace la llamada HTTP
      // GET /v1/inscripciones/:id
      const result = await this.inscripcionRepository.obtenerPorId(id);
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // El backend retorna: { enrollment, enrollmentSubjects, studentAcademicData, management }
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener inscripción',
      };
    }
  }
}
