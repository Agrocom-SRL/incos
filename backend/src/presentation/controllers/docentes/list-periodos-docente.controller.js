/**
 * GET /api/v1/docentes/periodos-disponibles
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class ListPeriodosDocenteAsignacionController {
  constructor({ listPeriodosDocenteAsignacionUseCase, logger, responseFormatter }) {
    this.useCase = listPeriodosDocenteAsignacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { page, limit } = ListRequestDTO.fromQuery(req.query);
      const gestionPlanId = parseInt(String(req.query.gestionPlanId), 10);

      const result = await this.useCase.execute({ gestionPlanId, page, limit });

      return this.responseFormatter.list(
        res,
        result.periodos,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'periodos',
        req
      );
    } catch (error) {
      this.logger.error('Error al listar periodos (docentes asignación)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
