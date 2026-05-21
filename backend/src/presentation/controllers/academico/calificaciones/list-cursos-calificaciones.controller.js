/**
 * GET /api/v1/calificaciones/mis-cursos
 * GET /api/v1/calificaciones/coordinacion/docentes/:docenteId/cursos
 */

export class ListCursosCalificacionesController {
  /**
   * @param {Object} params
   * @param {Object} params.listCursosCalificacionesUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ listCursosCalificacionesUseCase, logger, responseFormatter }) {
    this.listCursosCalificacionesUseCase = listCursosCalificacionesUseCase;
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
      const docenteIdParam = req.params?.docenteId ?? req.query?.docenteId ?? null;
      const docenteId =
        docenteIdParam != null && docenteIdParam !== ''
          ? Number(docenteIdParam)
          : null;

      this.logger.info('[Calificaciones] Listado cursos docente', {
        usuarioId: req.usuario?.id,
        docenteId,
      });

      const payload = await this.listCursosCalificacionesUseCase.execute({
        usuarioId: req.usuario.id,
        docenteId,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Cursos obtenidos correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error listado cursos docente', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
