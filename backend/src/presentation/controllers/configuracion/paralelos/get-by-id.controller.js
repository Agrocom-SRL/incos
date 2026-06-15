import { BaseGetController } from '../../base/BaseGetController.js';

export class GetParaleloByIdController extends BaseGetController {
  constructor({ getParaleloByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getParaleloByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'paralelo',
      dataFieldName: 'paralelo',
    });
  }
}
