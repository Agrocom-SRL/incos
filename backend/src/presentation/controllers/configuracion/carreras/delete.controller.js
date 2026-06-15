import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteCarreraController extends BaseDeleteController {
  constructor({ deleteCarreraUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteCarreraUseCase,
      logger,
      responseFormatter,
      resourceName: 'carrera',
    });
  }
}

