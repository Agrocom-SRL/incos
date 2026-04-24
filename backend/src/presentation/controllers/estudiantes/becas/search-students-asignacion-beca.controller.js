/**
 * GET /api/v1/estudiantes/buscar-asignacion-beca
 * Estudiantes sin beca ACTIVA/PENDIENTE en gestión vigente (muestra previa o búsqueda).
 */

export class SearchStudentsForBecaAsignacionController {
  /**
   * @param {Object} params
   * @param {Object} params.searchStudentsForBecaAsignacionUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ searchStudentsForBecaAsignacionUseCase, logger, responseFormatter }) {
    this.searchStudentsForBecaAsignacionUseCase = searchStudentsForBecaAsignacionUseCase;
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

      this.logger.info('[Estudiantes] Búsqueda estudiantes para asignación beca', {
        preliminar,
        qLen: q.length,
        limit,
      });

      const estudiantes = await this.searchStudentsForBecaAsignacionUseCase.execute({
        q,
        limit,
        preliminar,
      });
      const total = estudiantes.length;

      return this.responseFormatter.list(
        res,
        estudiantes,
        {
          page: 1,
          limit,
          total,
          totalPages: 1,
        },
        'estudiantes (asignación beca)',
        req
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error en búsqueda estudiantes asignación beca', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
