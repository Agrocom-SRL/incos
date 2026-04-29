/**
 * GET /api/v1/docentes/planes-habilitados
 */

import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class ListPlanesHabilitadosDocenteController {
  constructor({ listPlanesHabilitadosDocenteUseCase, logger, responseFormatter }) {
    this.useCase = listPlanesHabilitadosDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { page, limit } = ListRequestDTO.fromQuery(req.query);
      const rawG = req.query.gestionId;
      const gestionId =
        rawG != null && rawG !== '' ? parseInt(String(rawG), 10) : null;

      const result = await this.useCase.execute({
        gestionId: Number.isFinite(gestionId) && gestionId > 0 ? gestionId : null,
        page,
        limit,
      });

      return this.responseFormatter.list(
        res,
        result.planes,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'planes habilitados',
        req
      );
    } catch (error) {
      this.logger.error('Error al listar planes habilitados (docentes)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
