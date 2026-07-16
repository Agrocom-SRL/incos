import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/cursos-capacitacion
 * Listado de cursos de capacitación (vista 155). dataFieldName: 'cursosCapacitacion'.
 */
export class ListCursosCapacitacionController extends BaseListController {
  constructor({ listCursosCapacitacionUseCase, logger, responseFormatter }) {
    super({
      useCase: listCursosCapacitacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'cursos de capacitación',
      dataFieldName: 'cursosCapacitacion',
    });
  }
}
