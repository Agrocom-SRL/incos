import { BaseGetController } from '../../base/BaseGetController.js';

export class GetCarreraByIdController extends BaseGetController {
  constructor({ getCarreraByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getCarreraByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'carrera',
      dataFieldName: 'carrera',
    });
  }
}
