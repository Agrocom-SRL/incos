import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteParaleloController extends BaseDeleteController {
  constructor({ deleteParaleloUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteParaleloUseCase,
      logger,
      responseFormatter,
      resourceName: 'paralelo',
    });
  }
}
