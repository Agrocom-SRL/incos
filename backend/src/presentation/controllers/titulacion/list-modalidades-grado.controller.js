import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/proyectos-grado/modalidades (T2)
 * Catálogo de modalidades de grado. dataFieldName: 'modalidadesGrado'.
 */
export class ListModalidadesGradoController extends BaseListController {
  constructor({ listModalidadesGradoUseCase, logger, responseFormatter }) {
    super({
      useCase: listModalidadesGradoUseCase,
      logger,
      responseFormatter,
      resourceName: 'modalidades de grado',
      dataFieldName: 'modalidadesGrado',
    });
  }
}
