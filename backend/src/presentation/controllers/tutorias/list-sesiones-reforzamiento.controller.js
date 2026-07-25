import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/acompanamiento/sesiones (A4)
 * Sesiones de reforzamiento (vista 161). dataFieldName: 'sesionesReforzamiento'.
 */
export class ListSesionesReforzamientoController extends BaseListController {
  constructor({ listSesionesReforzamientoUseCase, logger, responseFormatter }) {
    super({
      useCase: listSesionesReforzamientoUseCase,
      logger,
      responseFormatter,
      resourceName: 'sesiones de reforzamiento',
      dataFieldName: 'sesionesReforzamiento',
    });
  }
}
