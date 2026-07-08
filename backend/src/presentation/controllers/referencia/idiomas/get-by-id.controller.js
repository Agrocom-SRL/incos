import { BaseGetController } from '../../base/BaseGetController.js';

export class GetIdiomaByIdController extends BaseGetController {
  constructor({ getIdiomaByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getIdiomaByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'idioma',
      dataFieldName: 'idioma',
    });
  }
}
