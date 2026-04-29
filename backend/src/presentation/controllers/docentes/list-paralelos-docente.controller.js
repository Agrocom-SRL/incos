/**
 * GET /api/v1/docentes/paralelos-disponibles
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class ListParalelosDocenteAsignacionController {
  constructor({ listParalelosDocenteAsignacionUseCase, logger, responseFormatter }) {
    this.useCase = listParalelosDocenteAsignacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { page, limit } = ListRequestDTO.fromQuery(req.query);
      const gestionPlanId = parseInt(String(req.query.gestionPlanId), 10);
      const periodoId = parseInt(String(req.query.periodoId), 10);

      const result = await this.useCase.execute({ gestionPlanId, periodoId, page, limit });

      return this.responseFormatter.list(
        res,
        result.paralelos,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'paralelos',
        req
      );
    } catch (error) {
      this.logger.error('Error al listar paralelos (docentes asignación)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
