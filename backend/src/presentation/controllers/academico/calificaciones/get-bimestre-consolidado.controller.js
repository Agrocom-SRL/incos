export class GetBimestreConsolidadoController {
  constructor({ getBimestreConsolidadoUseCase, logger, responseFormatter }) {
    this.getBimestreConsolidadoUseCase = getBimestreConsolidadoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getBimestreConsolidadoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Consolidado del bimestre obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error GET bimestre consolidado', {
        error: error.message,
      });
      return next(error);
    }
  }
}
