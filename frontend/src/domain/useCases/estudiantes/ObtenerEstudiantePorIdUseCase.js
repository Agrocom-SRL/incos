/**
 * Use Case: Obtener Estudiante por ID
 * 
 * Single Responsibility: Orquestar la obtención de un estudiante por su ID
 * Dependency Inversion: Depende de la abstracción IEstudianteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Obtener un estudiante por ID con todos sus datos relacionados
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IEstudianteRepository } from '@repositories/IEstudianteRepository';

export class ObtenerEstudiantePorIdUseCase {
  /**
   * @param {IEstudianteRepository} estudianteRepository - Repositorio de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener un estudiante por ID
   * 
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(id) {
    try {
      // El repositorio hace la llamada HTTP
      // GET /v1/estudiantes/:id
      const result = await this.estudianteRepository.obtenerPorId(id);
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // El backend retorna: { student, guardians, disabilities, origins, documentDeliveries }
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener estudiante',
      };
    }
  }
}

