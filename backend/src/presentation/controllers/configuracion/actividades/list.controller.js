/**
 * GET /api/v1/actividades
 * Controller para listar actividades con filtros y paginación
 *
 * Endpoint:
 * GET /api/v1/actividades?page=1&limit=50&search=inscripcion&tipo=ACADEMICA&esDestacada=true
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar actividades
 * - Dependency Inversion: Depende de ListActividadesUseCase (abstracción)
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListActividadesController extends BaseListController {
  constructor({ listActividadesUseCase, logger, responseFormatter }) {
    super({
      useCase: listActividadesUseCase,
      logger,
      responseFormatter,
      resourceName: 'actividades',
      dataFieldName: 'actividades',
    });
  }
}
