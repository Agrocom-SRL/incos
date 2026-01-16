/**
 * Use Case: Actualizar Estudiante
 * 
 * Single Responsibility: Orquestar la validación y actualización de un estudiante existente
 * Dependency Inversion: Depende de la abstracción IEstudianteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (valida y orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación básica de datos requeridos del frontend
 * - Llamada al repositorio para actualizar el estudiante
 * - Procesamiento de errores de validación del backend
 * - Extracción de detalles de validación del backend
 * 
 * NOTA: La lógica de negocio completa (validar CI duplicado, actualizar relaciones, etc.)
 * está en el backend (UpdateStudentUseCase). Este Use Case solo orquesta la llamada.
 * 
 * Retorna datos del estudiante actualizado o errores de validación.
 */

import { IEstudianteRepository } from '@repositories/IEstudianteRepository';

export class ActualizarEstudianteUseCase {
  /**
   * @param {IEstudianteRepository} estudianteRepository - Repositorio de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta el caso de uso de actualizar un estudiante
   * 
   * @param {string|number} studentId - ID del estudiante a actualizar
   * @param {Object} datosEstudiante - Datos del estudiante a actualizar (estructura plana del frontend)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   * 
   * validationErrors: Array con errores de validación del backend
   * Formato: [{ field: 'campo', message: 'mensaje' }, ...]
   */
  async ejecutar(studentId, datosEstudiante) {
    try {
      // 1. Validación básica de estructura (última línea de defensa)
      // NOTA: La validación completa se hace en el hook (Application Layer) antes de llamar al Use Case
      // Esta validación es solo una verificación de seguridad
      
      // Validar ID del estudiante (requerido para actualización)
      if (!studentId || (typeof studentId !== 'string' && typeof studentId !== 'number')) {
        return {
          success: false,
          error: 'ID del estudiante es requerido',
        };
      }

      // Validar datos del estudiante (igual que CrearEstudianteUseCase)
      if (!datosEstudiante || typeof datosEstudiante !== 'object') {
        return {
          success: false,
          error: 'Los datos del estudiante son requeridos',
        };
      }

      // 2. Llamar al repositorio para actualizar el estudiante
      // El repositorio envía los datos al backend
      // El backend valida, transforma con DTO y ejecuta UpdateStudentUseCase
      const result = await this.estudianteRepository.actualizar(studentId, datosEstudiante);

      // 3. Procesar respuesta del repositorio
      // (Igual que CrearEstudianteUseCase)
      if (!result.success) {
        // El repositorio retorna error procesado por handleErrorResponse
        // Puede ser string o objeto con { code, message, details }
        let errorMessage = typeof result.error === 'object'
          ? (result.error?.message || 'Error al actualizar estudiante')
          : result.error;
        let validationErrors = null;

        // Si el error es un objeto con detalles de validación del backend
        if (typeof result.error === 'object' && result.error?.details) {
          validationErrors = Array.isArray(result.error.details) 
            ? result.error.details 
            : [result.error.details];
          errorMessage = result.error.message || 'Error de validación';
        }

        return {
          success: false,
          error: errorMessage || 'Error al actualizar estudiante',
          validationErrors,
        };
      }

      // 4. Retornar datos del estudiante actualizado
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      // Error inesperado (no debería llegar aquí si el repositorio maneja bien los errores)
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar estudiante',
      };
    }
  }
}
