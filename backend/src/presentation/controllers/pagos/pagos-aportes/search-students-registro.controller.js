/**
 * GET /api/v1/pagos-aportes/buscar-estudiantes-registro
 * Búsqueda de estudiantes para registrar aporte (similitudes por contacto, CI, código, nombres, carrera).
 */

export class SearchStudentsForAporteRegistroController {
  /**
   * @param {Object} params
   * @param {Object} params.searchStudentsForAporteRegistroUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ searchStudentsForAporteRegistroUseCase, logger, responseFormatter }) {
    this.searchStudentsForAporteRegistroUseCase = searchStudentsForAporteRegistroUseCase;
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

      this.logger.info('[Pagos] Búsqueda estudiantes para registro aporte', {
        preliminar,
        qLen: q.length,
        limit,
      });

      const estudiantes = await this.searchStudentsForAporteRegistroUseCase.execute({
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
        'estudiantes (registro aporte)',
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error en búsqueda estudiantes registro aporte', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
