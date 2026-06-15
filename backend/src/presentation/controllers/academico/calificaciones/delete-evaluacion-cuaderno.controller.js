export class DeleteEvaluacionCuadernoController {
  constructor({ deleteEvaluacionCuadernoUseCase, logger, responseFormatter }) {
    this.deleteEvaluacionCuadernoUseCase = deleteEvaluacionCuadernoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const result = await this.deleteEvaluacionCuadernoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        evaluacionId: req.params.evaluacionId,
      });
      return this.responseFormatter._success(
        res,
        result,
        { message: 'Evaluación eliminada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error DELETE evaluación', { error: error.message });
      return next(error);
    }
  }
}
