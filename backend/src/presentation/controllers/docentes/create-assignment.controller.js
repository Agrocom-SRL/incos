/**
 * POST /api/v1/docentes/asignaciones
 */

import { BaseCreateController } from '../base/BaseCreateController.js';

export class CreateTeacherAssignmentController extends BaseCreateController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/docentes/CreateTeacherAssignmentUseCase.js').CreateTeacherAssignmentUseCase} params.createTeacherAssignmentUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ createTeacherAssignmentUseCase, logger, responseFormatter }) {
    super({
      useCase: createTeacherAssignmentUseCase,
      logger,
      responseFormatter,
      resourceName: 'asignación docente',
      dataFieldName: 'asignacion',
    });
  }

  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de asignación docente', { body });
      const preparedData = this.prepareData(body);
      const userId = req.user?.id ?? null;
      const result = await this.useCase.execute(preparedData, userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear asignación docente', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
