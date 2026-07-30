import { BaseListController } from '../../base/BaseListController.js';

/**
 * GET /api/v1/supervision-docente (S1)
 * Listado de fichas de seguimiento en clase (vista 174).
 * Permiso: docentes.supervision.ficha LISTAR. dataFieldName: 'fichasSeguimiento'.
 */
export class ListFichasSeguimientoController extends BaseListController {
  constructor({ listFichasSeguimientoUseCase, logger, responseFormatter }) {
    super({
      useCase: listFichasSeguimientoUseCase,
      logger,
      responseFormatter,
      resourceName: 'fichas de seguimiento',
      dataFieldName: 'fichasSeguimiento',
    });
  }
}
