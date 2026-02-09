/**
 * POST /api/v1/inscripciones
 * Controller para registrar una nueva inscripción
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para registrar inscripciones
 * - Transformar datos del frontend (si es necesario)
 * - Delegar lógica de negocio a CreateEnrollmentUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * POST /api/v1/inscripciones
 * 
 * Body Parameters (sincronizados con el frontend):
 * - student_id: ID del estudiante (requerido)
 * - parallel_id: ID del paralelo (opcional si se envía teacher_assignment_ids)
 * - teacher_assignment_ids: Array de IDs de asignaciones docentes (opcional)
 * - enrollment_type: Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.) - opcional
 * - observations: Observaciones (opcional)
 * 
 * NOTA: enrollment_date NO se envía desde el frontend; el backend lo genera automáticamente
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para registrar inscripciones
 * - Dependency Inversion: Depende de CreateEnrollmentUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Usa DTOs de Application Layer para transformar datos (si es necesario)
 * - Depende de Application Layer (Use Cases inyectados, DTOs importados directamente)
 */
import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateEnrollmentController extends BaseCreateController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {CreateEnrollmentUseCase} params.createEnrollmentUseCase - Caso de uso para registrar inscripciones
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ createEnrollmentUseCase, logger, responseFormatter }) {
    super({
      useCase: createEnrollmentUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripción',
      dataFieldName: 'enrollment',
    });
  }

  /**
   * Prepara los datos del body antes de enviarlos al use case
   * Transforma campos snake_case del frontend a camelCase esperado por el use case
   * 
   * Soporta dos modos de inscripción:
   * 1. Con parallel_id: inscribe en todas las materias del paralelo
   * 2. Con teacher_assignment_ids: inscribe solo en las asignaciones docentes indicadas
   *    (permite múltiples paralelos/periodos)
   * 
   * NOTA: enrollmentDate NO se incluye aquí porque el backend lo genera automáticamente
   * en CreateEnrollmentUseCase usando la fecha actual.
   * 
   * @param {Object} body - Body de la petición HTTP (snake_case o camelCase)
   * @returns {Object} Datos preparados para el use case (camelCase)
   */
  prepareData(body) {
    // Transformar campos snake_case a camelCase
    // Soporta ambos formatos para flexibilidad
    return {
      studentId: body.student_id || body.studentId,
      parallelId: body.parallel_id || body.parallelId || null,
      teacherAssignmentIds: body.teacher_assignment_ids || body.teacherAssignmentIds || null,
      enrollmentType: body.enrollment_type || body.enrollmentType,
      // enrollmentDate se genera automáticamente en el use case, no se envía desde el frontend
      observations: body.observations || null,
    };
  }
}
