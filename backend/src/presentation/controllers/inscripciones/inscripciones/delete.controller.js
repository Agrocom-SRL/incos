/**
 * DELETE /api/v1/inscripciones/:id
 * Controller para eliminar una inscripción
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP DELETE para eliminar inscripciones
 * - Delegar lógica de negocio a DeleteEnrollmentUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * DELETE /api/v1/inscripciones/:id
 * 
 * Path Parameters:
 * - id: ID de la inscripción a eliminar
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para eliminar inscripciones
 * - Dependency Inversion: Depende de DeleteEnrollmentUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteEnrollmentController extends BaseDeleteController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {DeleteEnrollmentUseCase} params.deleteEnrollmentUseCase - Caso de uso para eliminar inscripciones
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ deleteEnrollmentUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteEnrollmentUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripción',
    });
  }
}
