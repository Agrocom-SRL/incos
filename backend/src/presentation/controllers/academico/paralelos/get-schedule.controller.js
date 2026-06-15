import { BaseGetController } from '../../base/BaseGetController.js';

/**
 * GET /api/v1/paralelos/:id/schedule
 */
export class GetParaleloScheduleController extends BaseGetController {
  constructor({ getParaleloScheduleUseCase, logger, responseFormatter }) {
    super({
      useCase: getParaleloScheduleUseCase,
      logger,
      responseFormatter,
      resourceName: 'horarios del paralelo',
      dataFieldName: 'schedule',
    });
  }
}
