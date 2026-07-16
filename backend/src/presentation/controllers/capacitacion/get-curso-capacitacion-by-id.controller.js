import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/cursos-capacitacion/:id
 * Ficha de curso de capacitación (vista 155 + bloques de la vista 154).
 * dataFieldName: 'cursoCapacitacion'.
 */
export class GetCursoCapacitacionByIdController extends BaseGetController {
  constructor({ getCursoCapacitacionByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getCursoCapacitacionByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'curso de capacitación',
      dataFieldName: 'cursoCapacitacion',
    });
  }
}
