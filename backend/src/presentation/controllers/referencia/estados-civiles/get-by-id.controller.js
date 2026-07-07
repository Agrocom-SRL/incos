import { BaseGetController } from '../../base/BaseGetController.js';

export class GetEstadoCivilByIdController extends BaseGetController {
  constructor({ getEstadoCivilByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getEstadoCivilByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'estado civil',
      dataFieldName: 'estadoCivil',
    });
  }
}
