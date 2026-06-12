/**
 * GET /api/v1/asistencia/mis-cursos
 * GET /api/v1/asistencia/coordinacion/docentes/:docenteId/cursos
 */

export class GetMisCursosAsistenciaController {
  constructor({ getMisCursosAsistenciaUseCase, logger, responseFormatter }) {
    this.getMisCursosAsistenciaUseCase = getMisCursosAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const docenteIdParam = req.params?.docenteId ?? req.query?.docenteId ?? null;
      const docenteId =
        docenteIdParam != null && docenteIdParam !== '' ? Number(docenteIdParam) : null;

      this.logger.info('[Asistencia] Listado cursos docente', {
        usuarioId: req.usuario?.id,
        docenteId,
      });

      const payload = await this.getMisCursosAsistenciaUseCase.execute({
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
      this.logger.error('[Asistencia] Error listado cursos docente', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
