import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteTipoParentescoController extends BaseDeleteController {
  constructor({ deleteTipoParentescoUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteTipoParentescoUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de parentesco',
    });
  }
}
