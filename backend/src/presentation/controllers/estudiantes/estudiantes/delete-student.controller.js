/**
 * DELETE /api/v1/estudiantes/:id
 * Controller para eliminar un estudiante
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP DELETE para eliminar estudiantes
 * - Extraer el ID del estudiante de los parámetros de ruta
 * - Delegar lógica de negocio a DeleteStudentUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para eliminar estudiantes
 * - Dependency Inversion: Depende de DeleteStudentUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */

import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteStudentController extends BaseDeleteController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {DeleteStudentUseCase} params.deleteStudentUseCase - Caso de uso para eliminar estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ deleteStudentUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteStudentUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiante',
    });
  }
}
