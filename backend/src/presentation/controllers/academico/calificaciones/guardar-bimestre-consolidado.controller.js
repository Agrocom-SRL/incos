export class GuardarBimestreConsolidadoController {
  constructor({ guardarBimestreConsolidadoUseCase, logger, responseFormatter }) {
    this.guardarBimestreConsolidadoUseCase = guardarBimestreConsolidadoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.guardarBimestreConsolidadoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Notas consolidadas guardadas' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error POST bimestre consolidado', {
        error: error.message,
      });
      return next(error);
    }
  }
}
