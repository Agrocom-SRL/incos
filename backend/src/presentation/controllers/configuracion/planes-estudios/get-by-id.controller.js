import { BaseGetController } from '../../base/BaseGetController.js';

export class GetPlanEstudiosByIdController extends BaseGetController {
  constructor({ getPlanEstudiosByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getPlanEstudiosByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'plan de estudios',
      dataFieldName: 'data',
    });
  }
}

