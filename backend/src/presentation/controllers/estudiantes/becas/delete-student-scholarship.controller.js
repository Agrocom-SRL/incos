/**
 * DELETE /api/v1/estudiantes/becas/:id
 * Controller para eliminar una beca asignada a un estudiante
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP DELETE para eliminar una beca asignada
 * - Delegar lógica de negocio a DeleteStudentScholarshipUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * DELETE /api/v1/estudiantes/becas/:id
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para eliminar becas asignadas
 * - Dependency Inversion: Depende de DeleteStudentScholarshipUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteStudentScholarshipController extends BaseDeleteController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {DeleteStudentScholarshipUseCase} params.deleteStudentScholarshipUseCase - Caso de uso para eliminar beca asignada
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ deleteStudentScholarshipUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteStudentScholarshipUseCase,
      logger,
      responseFormatter,
      resourceName: 'beca asignada',
    });
  }
}
