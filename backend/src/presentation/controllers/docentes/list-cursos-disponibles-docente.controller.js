/**
 * GET /api/v1/docentes/cursos-disponibles
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class ListCursosDisponiblesDocenteController {
  constructor({ listCursosDisponiblesDocenteUseCase, logger, responseFormatter }) {
    this.useCase = listCursosDisponiblesDocenteUseCase;
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
        result.cursos,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'cursos',
        req
      );
    } catch (error) {
      this.logger.error('Error al listar cursos disponibles (docentes)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
