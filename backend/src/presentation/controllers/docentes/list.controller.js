/**
 * GET /api/v1/docentes
 * Lista docentes con filtros y paginación (page, limit, search, sort).
 */

import { BaseListController } from '../base/BaseListController.js';

export class ListTeachersController extends BaseListController {
  /**
   * @param {Object} params
   * @param {Object} params.listTeachersUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ listTeachersUseCase, logger, responseFormatter }) {
    super({
      useCase: listTeachersUseCase,
      logger,
      responseFormatter,
      resourceName: 'docentes',
      dataFieldName: 'docentes',
    });
  }
}
