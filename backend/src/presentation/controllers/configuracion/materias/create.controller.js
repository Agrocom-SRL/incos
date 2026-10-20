import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateMateriaController extends BaseCreateController {
  constructor({ createMateriaUseCase, logger, responseFormatter }) {
    super({
      useCase: createMateriaUseCase,
      logger,
      responseFormatter,
      resourceName: 'materia',
      dataFieldName: 'materia',
    });
  }

  prepareData(body) {
    return body;
  }
}
