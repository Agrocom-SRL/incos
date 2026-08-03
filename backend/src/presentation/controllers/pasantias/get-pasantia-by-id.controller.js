import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/pasantias/:id (P2)
 * Ficha del trámite (vista 168 + raíz). dataFieldName: 'pasantia'.
 */
export class GetPasantiaByIdController extends BaseGetController {
  constructor({ getPasantiaUseCase, logger, responseFormatter }) {
    super({
      useCase: getPasantiaUseCase,
      logger,
      responseFormatter,
      resourceName: 'pasantía',
      dataFieldName: 'pasantia',
    });
  }
}
