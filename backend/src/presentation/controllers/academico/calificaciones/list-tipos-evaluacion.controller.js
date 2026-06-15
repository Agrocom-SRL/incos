import { BaseListController } from '../../base/BaseListController.js';

export class ListTiposEvaluacionController extends BaseListController {
  constructor({ listTiposEvaluacionUseCase, logger, responseFormatter }) {
    super({
      useCase: listTiposEvaluacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipos de evaluación',
      dataFieldName: 'tiposEvaluacion',
    });
  }
}
