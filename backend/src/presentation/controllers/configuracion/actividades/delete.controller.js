import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteActividadController extends BaseDeleteController {
  constructor({ deleteActividadUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteActividadUseCase,
      logger,
      responseFormatter,
      resourceName: 'actividad',
    });
  }
}
