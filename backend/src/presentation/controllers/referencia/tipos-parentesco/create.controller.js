import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateTipoParentescoController extends BaseCreateController {
  constructor({ createTipoParentescoUseCase, logger, responseFormatter }) {
    super({
      useCase: createTipoParentescoUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de parentesco',
      dataFieldName: 'tipoParentesco',
    });
  }

  prepareData(body) {
    return body;
  }
}
