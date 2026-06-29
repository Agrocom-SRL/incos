/**
 * PUT /api/v1/calificaciones/centralizador/:paraleloGestionId/bimestre/:bimestre/observaciones/:estudianteId
 */

export class SaveObservacionCentralizadorBimestreController {
  constructor({ saveObservacionCentralizadorBimestreUseCase, logger, responseFormatter }) {
    this.saveObservacionCentralizadorBimestreUseCase = saveObservacionCentralizadorBimestreUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.saveObservacionCentralizadorBimestreUseCase.execute({
        usuarioId: req.usuario?.id ?? null,
        paraleloGestionId: req.params.paraleloGestionId,
        estudianteId: req.params.estudianteId,
        bimestre: req.params.bimestre,
        observacion: req.body?.observacion,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Observación del bimestre guardada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error guardar observación centralizador', {
        error: error.message,
      });
      return next(error);
    }
  }
}
