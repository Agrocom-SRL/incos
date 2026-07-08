import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteDiscapacidadController extends BaseDeleteController {
  constructor({ deleteDiscapacidadUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteDiscapacidadUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de discapacidad',
    });
  }
}
