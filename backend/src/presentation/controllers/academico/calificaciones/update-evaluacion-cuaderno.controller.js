export class UpdateEvaluacionCuadernoController {
  constructor({ updateEvaluacionCuadernoUseCase, logger, responseFormatter }) {
    this.updateEvaluacionCuadernoUseCase = updateEvaluacionCuadernoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const evaluacion = await this.updateEvaluacionCuadernoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        evaluacionId: req.params.evaluacionId,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        { evaluacion },
        { message: 'Evaluación actualizada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error PUT evaluación', { error: error.message });
      return next(error);
    }
  }
}
