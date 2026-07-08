import { BaseCreateController } from '../../base/BaseCreateController.js';

export class CreateDocumentacionController extends BaseCreateController {
  constructor({ createDocumentacionUseCase, logger, responseFormatter }) {
    super({
      useCase: createDocumentacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de documentación',
      dataFieldName: 'documentacion',
    });
  }

  prepareData(body) {
    return body;
  }
}
