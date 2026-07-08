import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateActividadController extends BaseCreateController {
  constructor({ createActividadUseCase, logger, responseFormatter }) {
    super({
      useCase: createActividadUseCase,
      logger,
      responseFormatter,
      resourceName: 'actividad',
      dataFieldName: 'actividad',
    });
  }

  prepareData(body) {
    return body;
  }
}
