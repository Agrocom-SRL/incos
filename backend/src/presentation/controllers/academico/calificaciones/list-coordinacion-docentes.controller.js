/**
 * GET /api/v1/calificaciones/coordinacion/docentes
 */

export class ListCoordinacionCalificacionesDocentesController {
  /**
   * @param {Object} params
   * @param {Object} params.listCoordinacionCalificacionesDocentesUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ listCoordinacionCalificacionesDocentesUseCase, logger, responseFormatter }) {
    this.listCoordinacionCalificacionesDocentesUseCase = listCoordinacionCalificacionesDocentesUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  /**
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async handle(req, res, next) {
    try {
      const preliminar = req.query.preliminar === '1';
      const q = req.query.q != null ? String(req.query.q).trim() : '';
      const limitRaw = req.query.limit != null ? parseInt(req.query.limit, 10) : 50;
      const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), 100);

      this.logger.info('[Calificaciones] Listado coordinación docentes', {
        preliminar,
        qLen: q.length,
        limit,
      });

      const payload = await this.listCoordinacionCalificacionesDocentesUseCase.execute({
        q,
        limit,
        preliminar,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Coordinación de calificaciones obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error listado coordinación docentes', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
