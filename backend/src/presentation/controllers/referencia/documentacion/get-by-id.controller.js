import { BaseGetController } from '../../base/BaseGetController.js';

export class GetDocumentacionByIdController extends BaseGetController {
  constructor({ getDocumentacionByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getDocumentacionByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de documentación',
      dataFieldName: 'documentacion',
    });
  }
}
