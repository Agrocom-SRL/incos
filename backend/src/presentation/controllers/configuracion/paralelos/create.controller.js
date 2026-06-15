import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateParaleloController extends BaseCreateController {
  constructor({ createParaleloUseCase, logger, responseFormatter }) {
    super({
      useCase: createParaleloUseCase,
      logger,
      responseFormatter,
      resourceName: 'paralelo',
      dataFieldName: 'paralelo',
    });
  }

  prepareData(body) {
    return body;
  }
}
