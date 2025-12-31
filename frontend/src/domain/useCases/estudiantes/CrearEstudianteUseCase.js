/**
 * Use Case: Crear Estudiante
 * 
 * Single Responsibility: Orquestar la validación y creación de un nuevo estudiante
 * Dependency Inversion: Depende de la abstracción IEstudianteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (valida y orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación de datos del estudiante (si es necesario)
 * - Llamada al repositorio para crear el estudiante
 * - Procesamiento de errores de validación del backend
 * 
 * Retorna datos del estudiante creado o errores de validación.
 */

import { IEstudianteRepository } from '@repositories/IEstudianteRepository';

export class CrearEstudianteUseCase {
  /**
   * @param {IEstudianteRepository} estudianteRepository - Repositorio de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta el caso de uso de crear un estudiante
   * 
   * @param {Object} datosEstudiante - Datos del estudiante a crear
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   * 
   * validationErrors: Objeto con errores de validación del backend
   * Formato: { campo: 'mensaje de error', ... }
   */
  async ejecutar(datosEstudiante) {
    try {
      // Validación básica (puede extenderse según necesidades)
      if (!datosEstudiante || typeof datosEstudiante !== 'object') {
        return {
          success: false,
          error: 'Los datos del estudiante son requeridos',
        };
      }

      // Llamar al repositorio para crear el estudiante
      const result = await this.estudianteRepository.crear(datosEstudiante);

      // Si hay error, procesar errores de validación si existen
      if (!result.success) {
        // El repositorio retorna error crudo, aquí procesamos si hay detalles de validación
        // El backend puede retornar error.response.data.error.details
        // Pero el repositorio ya lo convirtió en error string
        // Si necesitamos validationErrors, debemos acceder al error original
        // Por ahora retornamos el error tal como viene del repositorio
        
        return result;
      }

      // Retornar datos del estudiante creado
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al crear estudiante',
      };
    }
  }
}

