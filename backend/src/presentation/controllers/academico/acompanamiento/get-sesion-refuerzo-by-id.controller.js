import { BaseGetController } from '../../base/BaseGetController.js';

/**
 * GET /api/v1/acompanamiento/sesiones/:id (A5)
 * Ficha de la sesión (vista 161 + estudiantes ⋈ vista 156).
 * dataFieldName: 'sesionRefuerzo'.
 */
export class GetSesionRefuerzoByIdController extends BaseGetController {
  constructor({ getSesionRefuerzoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getSesionRefuerzoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'sesión de refuerzo',
      dataFieldName: 'sesionRefuerzo',
    });
  }
}
