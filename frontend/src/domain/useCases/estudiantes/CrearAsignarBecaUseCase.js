/**
 * Use Case: Crear Asignación de Beca
 * 
 * Single Responsibility: Orquestar la validación y creación de una nueva asignación de beca
 * Dependency Inversion: Depende de la abstracción IEstudianteBecaRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (valida y orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación básica de datos requeridos del frontend
 * - Llamada al repositorio para crear la asignación de beca
 * - Procesamiento de errores de validación del backend
 * - Extracción de detalles de validación del backend
 * 
 * NOTA: La lógica de negocio completa (validar estudiante, validar beca, etc.)
 * está en el backend (CreateStudentScholarshipUseCase). Este Use Case solo orquesta la llamada.
 * 
 * Retorna datos de la asignación de beca creada o errores de validación.
 */

import { IEstudianteBecaRepository } from '@repositories/IEstudianteBecaRepository';

export class CrearAsignarBecaUseCase {
  /**
   * @param {IEstudianteBecaRepository} estudianteBecaRepository - Repositorio de becas de estudiantes
   */
  constructor(estudianteBecaRepository) {
    this.estudianteBecaRepository = estudianteBecaRepository;
  }

  /**
   * Ejecuta el caso de uso de crear una asignación de beca
   * 
   * @param {Object} datosAsignacionBeca - Datos de la asignación de beca a crear
   * @param {number} datosAsignacionBeca.student_id - ID del estudiante (requerido para construir la URL)
   * @param {number} datosAsignacionBeca.beca_descuento_id - ID de la beca/descuento (requerido)
   * @param {string} [datosAsignacionBeca.observaciones] - Observaciones (opcional, puede ser null, vacío o string)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   * 
   * validationErrors: Array con errores de validación del backend
   * Formato: [{ field: 'campo', message: 'mensaje' }, ...]
   * 
   * data: Objeto con la asignación de beca creada
   * 
   * NOTA: La gestión se obtiene automáticamente de la configuración del sistema.
   * La fecha de solicitud se establece automáticamente como la fecha actual.
   * El estado se establece automáticamente como PENDIENTE.
   */
  async ejecutar(datosAsignacionBeca) {
    try {
      // 1. Validación básica de estructura (última línea de defensa)
      // NOTA: La validación completa se hace en el hook (Application Layer) antes de llamar al Use Case
      // Esta validación es solo una verificación de seguridad
      if (!datosAsignacionBeca || typeof datosAsignacionBeca !== 'object') {
        return {
          success: false,
          error: 'Los datos de la asignación de beca son requeridos',
        };
      }

      // Validar campos requeridos (validación básica de estructura)
      // NOTA: La validación completa se hace en el hook (Application Layer) antes de llamar al Use Case
      if (!datosAsignacionBeca.student_id) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }

      if (!datosAsignacionBeca.beca_descuento_id) {
        return {
          success: false,
          error: 'El ID de la beca/descuento es requerido',
        };
      }

      // 2. Separar student_id del body (va en el path, no en el body)
      const { student_id, ...bodyData } = datosAsignacionBeca;

      // 3. Llamar al repositorio para crear la asignación de beca
      // El repositorio envía los datos al backend
      // El backend valida, crea la asignación y ejecuta CreateStudentScholarshipUseCase
      const result = await this.estudianteBecaRepository.crear(bodyData, { studentId: student_id });

      // 3. Procesar respuesta del repositorio
      if (!result.success) {
        // El repositorio retorna error procesado por handleErrorResponse
        // Puede ser string o objeto con { code, message, details }
        let errorMessage = typeof result.error === 'object'
          ? (result.error?.message || 'Error al crear asignación de beca')
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
          error: errorMessage || 'Error al crear asignación de beca',
          validationErrors,
        };
      }

      // 4. Retornar datos de la asignación de beca creada
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      // Error inesperado (no debería llegar aquí si el repositorio maneja bien los errores)
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear asignación de beca',
      };
    }
  }
}
