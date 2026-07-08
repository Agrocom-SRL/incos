import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteAulaController extends BaseDeleteController {
  constructor({ deleteAulaUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteAulaUseCase,
      logger,
      responseFormatter,
      resourceName: 'aula',
    });
  }
}
