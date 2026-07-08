import { BaseGetController } from '../../base/BaseGetController.js';

export class GetActividadByIdController extends BaseGetController {
  constructor({ getActividadByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getActividadByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'actividad',
      dataFieldName: 'actividad',
    });
  }
}
