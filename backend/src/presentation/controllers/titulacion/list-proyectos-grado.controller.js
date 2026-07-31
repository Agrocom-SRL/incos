import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/proyectos-grado (T1)
 * Listado de proyectos de grado (vista 160). dataFieldName: 'proyectosGrado'.
 */
export class ListProyectosGradoController extends BaseListController {
  constructor({ listProyectosGradoUseCase, logger, responseFormatter }) {
    super({
      useCase: listProyectosGradoUseCase,
      logger,
      responseFormatter,
      resourceName: 'proyectos de grado',
      dataFieldName: 'proyectosGrado',
    });
  }
}
