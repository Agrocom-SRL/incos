/**
 * POST /api/v1/asistencia/cursos/:asignacionId/registro/reabrir?bimestre=
 */
export class ReabrirRegistroAsistenciaController {
  constructor({ reabrirRegistroAsistenciaUseCase, logger, responseFormatter }) {
    this.reabrirRegistroAsistenciaUseCase = reabrirRegistroAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.reabrirRegistroAsistenciaUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.query.bimestre,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Registro de asistencia reabierto' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error POST reabrir registro', { error: error.message });
      return next(error);
    }
  }
}
