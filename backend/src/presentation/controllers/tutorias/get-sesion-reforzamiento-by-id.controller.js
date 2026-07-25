import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/acompanamiento/sesiones/:id (A5)
 * Ficha de la sesión (vista 161 + participantes ⋈ vista 156).
 * dataFieldName: 'sesionReforzamiento'.
 */
export class GetSesionReforzamientoByIdController extends BaseGetController {
  constructor({ getSesionReforzamientoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getSesionReforzamientoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'sesión de reforzamiento',
      dataFieldName: 'sesionReforzamiento',
    });
  }
}
