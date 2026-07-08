import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteIdiomaController extends BaseDeleteController {
  constructor({ deleteIdiomaUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteIdiomaUseCase,
      logger,
      responseFormatter,
      resourceName: 'idioma',
    });
  }
}
