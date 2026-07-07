import { BaseGetController } from '../../base/BaseGetController.js';

export class GetTipoEvaluacionByIdController extends BaseGetController {
  constructor({ getTipoEvaluacionByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getTipoEvaluacionByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de evaluación',
      dataFieldName: 'tipoEvaluacion',
    });
  }
}
