import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteEstadoCivilController extends BaseDeleteController {
  constructor({ deleteEstadoCivilUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteEstadoCivilUseCase,
      logger,
      responseFormatter,
      resourceName: 'estado civil',
    });
  }
}
