import { BaseGetController } from '../../base/BaseGetController.js';

export class GetTipoParentescoByIdController extends BaseGetController {
  constructor({ getTipoParentescoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getTipoParentescoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de parentesco',
      dataFieldName: 'tipoParentesco',
    });
  }
}
