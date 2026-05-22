export class ResetNotasEvaluacionCuadernoController {
  constructor({ resetNotasEvaluacionCuadernoUseCase, logger, responseFormatter }) {
    this.resetNotasEvaluacionCuadernoUseCase = resetNotasEvaluacionCuadernoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const result = await this.resetNotasEvaluacionCuadernoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        evaluacionId: req.params.evaluacionId,
      });
      return this.responseFormatter._success(
        res,
        result,
        { message: 'Notas restablecidas' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error DELETE notas evaluación', {
        error: error.message,
      });
      return next(error);
    }
  }
}
