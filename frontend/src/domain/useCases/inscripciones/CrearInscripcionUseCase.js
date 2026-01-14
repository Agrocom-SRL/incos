/**
 * Use Case: Crear Inscripción
 * 
 * Single Responsibility: Orquestar la validación y creación de una nueva inscripción
 * Dependency Inversion: Depende de la abstracción IInscripcionRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (valida y orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación básica de datos requeridos del frontend
 * - Llamada al repositorio para crear la inscripción
 * - Procesamiento de errores de validación del backend
 * - Extracción de detalles de validación del backend
 * 
 * NOTA: La lógica de negocio completa (crear datos académicos, obtener materias del paralelo, etc.)
 * está en el backend (CreateEnrollmentUseCase). Este Use Case solo orquesta la llamada.
 * 
 * Retorna datos de la inscripción creada con todas sus materias o errores de validación.
 */

import { IInscripcionRepository } from '@repositories/IInscripcionRepository';

export class CrearInscripcionUseCase {
  /**
   * @param {IInscripcionRepository} inscripcionRepository - Repositorio de inscripciones
   */
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * Ejecuta el caso de uso de crear una inscripción
   * 
   * @param {Object} datosInscripcion - Datos de la inscripción a crear
   * @param {number} datosInscripcion.student_id - ID del estudiante (requerido)
   * @param {number} datosInscripcion.parallel_id - ID del paralelo (requerido)
   * @param {string} [datosInscripcion.enrollment_type] - Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.) - opcional
   * @param {string} [datosInscripcion.observations] - Observaciones (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   * 
   * validationErrors: Array con errores de validación del backend
   * Formato: [{ field: 'campo', message: 'mensaje' }, ...]
   * 
   * data: Objeto con { enrollment, enrollmentSubjects }
   */
  async ejecutar(datosInscripcion) {
    try {
      // 1. Validación básica de estructura (última línea de defensa)
      // NOTA: La validación completa se hace en el hook (Application Layer) antes de llamar al Use Case
      // Esta validación es solo una verificación de seguridad
      if (!datosInscripcion || typeof datosInscripcion !== 'object') {
        return {
          success: false,
          error: 'Los datos de la inscripción son requeridos',
        };
      }

      // Validar campos requeridos
      if (!datosInscripcion.student_id) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }

      if (!datosInscripcion.parallel_id) {
        return {
          success: false,
          error: 'El ID del paralelo es requerido',
        };
      }

      // 2. Llamar al repositorio para crear la inscripción
      // El repositorio envía los datos al backend
      // El backend valida, crea datos académicos si no existen, obtiene materias del paralelo
      // y ejecuta CreateEnrollmentUseCase
      const result = await this.inscripcionRepository.crear(datosInscripcion);

      // 3. Procesar respuesta del repositorio
      if (!result.success) {
        // El repositorio retorna error procesado por handleErrorResponse
        // Puede ser string o objeto con { code, message, details }
        let errorMessage = typeof result.error === 'object'
          ? (result.error?.message || 'Error al crear inscripción')
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
          error: errorMessage || 'Error al crear inscripción',
          validationErrors,
        };
      }

      // 4. Retornar datos de la inscripción creada con todas sus materias
      // El backend retorna: { enrollment, enrollmentSubjects }
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      // Error inesperado (no debería llegar aquí si el repositorio maneja bien los errores)
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear inscripción',
      };
    }
  }
}
