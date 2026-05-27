import { BaseGetController } from '../../base/BaseGetController.js';

export class GetMateriaByIdController extends BaseGetController {
  constructor({ getMateriaByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getMateriaByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'materia',
      dataFieldName: 'materia',
    });
  }
}

