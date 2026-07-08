import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeleteDocumentacionController extends BaseDeleteController {
  constructor({ deleteDocumentacionUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteDocumentacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipo de documentación',
    });
  }
}
