import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreatePlanEstudiosController extends BaseCreateController {
  constructor({ createPlanEstudiosUseCase, logger, responseFormatter }) {
    super({
      useCase: createPlanEstudiosUseCase,
      logger,
      responseFormatter,
      resourceName: 'plan de estudios',
      dataFieldName: 'plan_estudio',
    });
  }
}

