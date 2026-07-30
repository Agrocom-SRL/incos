import { BaseGetController } from '../../base/BaseGetController.js';

/**
 * GET /api/v1/supervision-docente/:id (S2)
 * Ficha completa (entidad raíz + contexto de la vista 174).
 * Permiso: docentes.supervision.ficha DETALLE. dataFieldName: 'fichaSeguimiento'.
 */
export class GetFichaSeguimientoByIdController extends BaseGetController {
  constructor({ getFichaSeguimientoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getFichaSeguimientoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'ficha de seguimiento',
      dataFieldName: 'fichaSeguimiento',
    });
  }
}
