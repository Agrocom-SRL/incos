import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateCarreraController extends BaseCreateController {
  constructor({ createCarreraUseCase, logger, responseFormatter }) {
    super({
      useCase: createCarreraUseCase,
      logger,
      responseFormatter,
      resourceName: 'carrera',
      dataFieldName: 'carrera',
    });
  }

  prepareData(body) {
    // Mantener body tal cual; el use case normaliza aliases.
    return body;
  }
}

