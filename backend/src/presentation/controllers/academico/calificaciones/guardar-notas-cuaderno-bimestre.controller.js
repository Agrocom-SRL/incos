export class GuardarNotasCuadernoBimestreController {
  constructor({ guardarNotasCuadernoBimestreUseCase, logger, responseFormatter }) {
    this.guardarNotasCuadernoBimestreUseCase = guardarNotasCuadernoBimestreUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.guardarNotasCuadernoBimestreUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Notas guardadas y recalculadas' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error POST guardar cuaderno', {
        error: error.message,
      });
      return next(error);
    }
  }
}
