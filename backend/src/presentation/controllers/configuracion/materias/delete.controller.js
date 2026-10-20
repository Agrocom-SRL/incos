import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteMateriaController extends BaseDeleteController {
  constructor({ deleteMateriaUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteMateriaUseCase,
      logger,
      responseFormatter,
      resourceName: 'materia',
    });
  }
}
