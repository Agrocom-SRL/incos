export class ReabrirBimestreCursoController {
  constructor({ reabrirBimestreCursoUseCase, logger, responseFormatter }) {
    this.reabrirBimestreCursoUseCase = reabrirBimestreCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.reabrirBimestreCursoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestreNum: req.params.bimestre,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Bimestre reabierto' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error POST reabrir bimestre', {
        error: error.message,
      });
      return next(error);
    }
  }
}
