import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteTipoEvaluacionController extends BaseDeleteController {
  constructor({ deleteTipoEvaluacionUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteTipoEvaluacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de evaluación',
    });
  }
}
