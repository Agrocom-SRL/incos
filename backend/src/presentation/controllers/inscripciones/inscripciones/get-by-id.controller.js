/**
 * GET /api/v1/inscripciones/:id
 * Controller para obtener una inscripción por ID
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para obtener inscripciones por ID
 * - Delegar lógica de negocio a GetEnrollmentByIdUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/inscripciones/:id
 *
 * Path Parameters:
 * - id: ID de la inscripción
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para obtener inscripciones por ID
 * - Dependency Inversion: Depende de GetEnrollmentByIdUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseGetController } from '../../base/BaseGetController.js';

export class GetEnrollmentByIdController extends BaseGetController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GetEnrollmentByIdUseCase} params.getEnrollmentByIdUseCase - Caso de uso para obtener inscripciones por ID
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ getEnrollmentByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getEnrollmentByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripción',
      dataFieldName: 'enrollment',
    });
  }
}
