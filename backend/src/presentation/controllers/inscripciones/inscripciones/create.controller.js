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
 * Body Parameters:
 * - studentAcademicDataId: ID de datos académicos del estudiante
 * - managementId: ID de la gestión académica
 * - enrollmentType: Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.)
 * - enrollmentDate: Fecha de inscripción (opcional)
 * - observations: Observaciones (opcional)
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
   * @param {Object} body - Body de la petición HTTP
   * @returns {Object} Datos preparados para el use case (camelCase)
   */
  prepareData(body) {
    // Transformar campos snake_case a camelCase
    return {
      studentId: body.student_id || body.studentId,
      parallelId: body.parallel_id || body.parallelId,
      enrollmentType: body.enrollment_type || body.enrollmentType,
      enrollmentDate: body.enrollment_date || body.enrollmentDate,
      observations: body.observations,
    };
  }
}
