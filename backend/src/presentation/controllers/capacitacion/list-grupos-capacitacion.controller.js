import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/cursos-capacitacion/grupos
 * Listado de grupos de todas las capacitaciones (curso, aula, cupo, inscritos
 * y horarios). dataFieldName: 'grupos'.
 */
export class ListGruposCapacitacionController extends BaseListController {
  constructor({ listGruposCapacitacionUseCase, logger, responseFormatter }) {
    super({
      useCase: listGruposCapacitacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'grupos de capacitación',
      dataFieldName: 'grupos',
    });
  }
}
