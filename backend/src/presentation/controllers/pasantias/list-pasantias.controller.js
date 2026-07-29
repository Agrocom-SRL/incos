import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/pasantias (P1)
 * Listado de trámites de pasantía/convalidación (vista 167).
 * dataFieldName: 'pasantias'.
 */
export class ListPasantiasController extends BaseListController {
  constructor({ listPasantiasUseCase, logger, responseFormatter }) {
    super({
      useCase: listPasantiasUseCase,
      logger,
      responseFormatter,
      resourceName: 'pasantías',
      dataFieldName: 'pasantias',
    });
  }
}
