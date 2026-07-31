import { BaseListController } from '../../base/BaseListController.js';

/**
 * GET /api/v1/acompanamiento/sesiones (A4)
 * Sesiones de refuerzo (vista 161). dataFieldName: 'sesionesRefuerzo'.
 */
export class ListSesionesRefuerzoController extends BaseListController {
  constructor({ listSesionesRefuerzoUseCase, logger, responseFormatter }) {
    super({
      useCase: listSesionesRefuerzoUseCase,
      logger,
      responseFormatter,
      resourceName: 'sesiones de refuerzo',
      dataFieldName: 'sesionesRefuerzo',
    });
  }
}
