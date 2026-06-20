/**
 * GET /api/v1/asistencia/cursos/:asignacionId/planilla?desde=&hasta=
 */
export class GetPlanillaAsistenciaController {
  constructor({ getPlanillaAsistenciaSemanalUseCase, logger, responseFormatter }) {
    this.getPlanillaAsistenciaSemanalUseCase = getPlanillaAsistenciaSemanalUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getPlanillaAsistenciaSemanalUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        desde: req.query.desde,
        hasta: req.query.hasta,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Planilla de asistencia obtenida' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error GET planilla', { error: error.message });
      return next(error);
    }
  }
}
