import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateEstadoCivilController extends BaseCreateController {
  constructor({ createEstadoCivilUseCase, logger, responseFormatter }) {
    super({
      useCase: createEstadoCivilUseCase,
      logger,
      responseFormatter,
      resourceName: 'estado civil',
      dataFieldName: 'estadoCivil',
    });
  }

  prepareData(body) {
    return body;
  }
}
