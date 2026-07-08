import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateDiscapacidadController extends BaseCreateController {
  constructor({ createDiscapacidadUseCase, logger, responseFormatter }) {
    super({
      useCase: createDiscapacidadUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de discapacidad',
      dataFieldName: 'discapacidad',
    });
  }

  prepareData(body) {
    return body;
  }
}
