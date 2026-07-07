import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateTipoEvaluacionController extends BaseCreateController {
  constructor({ createTipoEvaluacionUseCase, logger, responseFormatter }) {
    super({
      useCase: createTipoEvaluacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de evaluación',
      dataFieldName: 'tipoEvaluacion',
    });
  }

  prepareData(body) {
    return body;
  }
}
