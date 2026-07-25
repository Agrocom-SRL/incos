import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/proyectos-grado/:id (T6)
 * Ficha del proyecto de grado (vista 160 + integrantes 159 + raíz).
 * dataFieldName: 'proyectoGrado'.
 */
export class GetProyectoGradoByIdController extends BaseGetController {
  constructor({ getProyectoGradoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getProyectoGradoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'proyecto de grado',
      dataFieldName: 'proyectoGrado',
    });
  }
}
