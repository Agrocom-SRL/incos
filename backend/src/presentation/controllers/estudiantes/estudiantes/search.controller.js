/**
 * GET /api/v1/estudiantes/search
 * Controller para buscar estudiantes por texto libre
 * 
 * Busca en: codigo_estudiante, ci, apellido_paterno, apellido_materno, nombres
 */
import { BaseSearchController } from '../../base/BaseSearchController.js';

export class SearchStudentController extends BaseSearchController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {SearchStudentUseCase} params.searchStudentUseCase - Caso de uso para buscar estudiante
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ searchStudentUseCase, logger, responseFormatter }) {
    super({
      useCase: searchStudentUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiante',
      dataFieldName: 'student',
    });
  }
}
