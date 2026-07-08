import { BaseGetController } from '../../base/BaseGetController.js';

export class GetDiscapacidadByIdController extends BaseGetController {
  constructor({ getDiscapacidadByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getDiscapacidadByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de discapacidad',
      dataFieldName: 'discapacidad',
    });
  }
}
