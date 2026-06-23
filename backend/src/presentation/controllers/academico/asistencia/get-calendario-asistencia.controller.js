/**
 * GET /api/v1/asistencia/cursos/:asignacionId/calendario?bimestre=
 */
export class GetCalendarioAsistenciaController {
  constructor({ getCalendarioAsistenciaUseCase, logger, responseFormatter }) {
    this.getCalendarioAsistenciaUseCase = getCalendarioAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getCalendarioAsistenciaUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.query.bimestre,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Calendario de asistencia obtenido' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error GET calendario', { error: error.message });
      return next(error);
    }
  }
}
