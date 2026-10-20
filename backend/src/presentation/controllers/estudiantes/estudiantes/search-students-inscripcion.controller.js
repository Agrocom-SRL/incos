/**
 * GET /api/v1/estudiantes/buscar-para-inscripcion
 * Muestra previa o búsqueda de estudiantes para el wizard de Inscripción nueva.
 * No excluye a los ya matriculados en la gestión vigente: los anota con
 * yaMatriculadoGestionActual para que el frontend avise/bloquee la selección.
 */

export class SearchStudentsForInscripcionController {
  /**
   * @param {Object} params
   * @param {Object} params.searchStudentsForInscripcionUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ searchStudentsForInscripcionUseCase, logger, responseFormatter }) {
    this.searchStudentsForInscripcionUseCase = searchStudentsForInscripcionUseCase;
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
      const soloNuevos = req.query.solo_nuevos === '1';
      const q = req.query.q != null ? String(req.query.q).trim() : '';
      const defaultLimit = soloNuevos ? 10 : 50;
      const limitRaw = req.query.limit != null ? parseInt(req.query.limit, 10) : defaultLimit;
      const limit = Number.isNaN(limitRaw)
        ? defaultLimit
        : Math.min(Math.max(limitRaw, 1), 100);

      this.logger.info('[Estudiantes] Búsqueda estudiantes para inscripción', {
        preliminar,
        soloNuevos,
        qLen: q.length,
        limit,
      });

      const estudiantes = await this.searchStudentsForInscripcionUseCase.execute({
        q,
        limit,
        preliminar,
        soloNuevos,
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
        'estudiantes (inscripción)',
        req
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error en búsqueda estudiantes para inscripción', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
