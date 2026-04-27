/**
 * GET /api/v1/docentes/cursos-por-paralelo
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class ListCursosPorParaleloDocenteController {
  constructor({ listCursosPorParaleloDocenteUseCase, logger, responseFormatter }) {
    this.useCase = listCursosPorParaleloDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { page, limit } = ListRequestDTO.fromQuery(req.query);
      const paraleloId = parseInt(String(req.query.paraleloId), 10);

      const result = await this.useCase.execute({ paraleloId, page, limit });

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
      this.logger.error('Error al listar cursos por paralelo (docentes asignación)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
