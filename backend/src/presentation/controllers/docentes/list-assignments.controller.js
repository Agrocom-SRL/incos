/**
 * GET /api/v1/docentes/asignaciones
 */

import { BaseListController } from '../base/BaseListController.js';

export class ListTeacherAssignmentsController extends BaseListController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/docentes/ListTeacherAssignmentsUseCase.js').ListTeacherAssignmentsUseCase} params.listTeacherAssignmentsUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ listTeacherAssignmentsUseCase, logger, responseFormatter }) {
    super({
      useCase: listTeacherAssignmentsUseCase,
      logger,
      responseFormatter,
      resourceName: 'asignaciones docentes',
      dataFieldName: 'asignaciones',
    });
  }
}
