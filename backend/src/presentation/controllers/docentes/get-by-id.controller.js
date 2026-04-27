/**
 * GET /api/v1/docentes/:id
 */

import { BaseGetController } from '../base/BaseGetController.js';

export class GetTeacherByIdController extends BaseGetController {
  /**
   * @param {Object} params
   * @param {Object} params.getTeacherDetailUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getTeacherDetailUseCase, logger, responseFormatter }) {
    super({
      useCase: getTeacherDetailUseCase,
      logger,
      responseFormatter,
      resourceName: 'docente',
      dataFieldName: 'docente',
    });
  }
}
