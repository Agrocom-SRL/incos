import { BaseGetController } from '../../base/BaseGetController.js';

export class GetAulaByIdController extends BaseGetController {
  constructor({ getAulaByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getAulaByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'aula',
      dataFieldName: 'aula',
    });
  }
}
