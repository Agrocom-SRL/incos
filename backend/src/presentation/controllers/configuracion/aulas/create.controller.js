import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateAulaController extends BaseCreateController {
  constructor({ createAulaUseCase, logger, responseFormatter }) {
    super({
      useCase: createAulaUseCase,
      logger,
      responseFormatter,
      resourceName: 'aula',
      dataFieldName: 'aula',
    });
  }

  prepareData(body) {
    return body;
  }
}
