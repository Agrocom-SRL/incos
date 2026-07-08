import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateIdiomaController extends BaseCreateController {
  constructor({ createIdiomaUseCase, logger, responseFormatter }) {
    super({
      useCase: createIdiomaUseCase,
      logger,
      responseFormatter,
      resourceName: 'idioma',
      dataFieldName: 'idioma',
    });
  }

  prepareData(body) {
    return body;
  }
}
