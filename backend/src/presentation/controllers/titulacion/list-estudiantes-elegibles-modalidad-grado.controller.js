import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/proyectos-grado/estudiantes-elegibles?search=&carreraId=&gestionId=
 * Requisito 1 — extensión 2026-07-31.
 * Estudiantes de 3er año SIN proyecto vigente (vista 178).
 * dataFieldName: 'estudiantesElegibles'.
 */
export class ListEstudiantesElegiblesModalidadGradoController extends BaseListController {
  constructor({ listEstudiantesElegiblesModalidadGradoUseCase, logger, responseFormatter }) {
    super({
      useCase: listEstudiantesElegiblesModalidadGradoUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiantes elegibles para modalidad de graduación',
      dataFieldName: 'estudiantesElegibles',
    });
  }
}
