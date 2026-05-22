export class CreateEvaluacionCuadernoController {
  constructor({ createEvaluacionCuadernoUseCase, logger, responseFormatter }) {
    this.createEvaluacionCuadernoUseCase = createEvaluacionCuadernoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const evaluacion = await this.createEvaluacionCuadernoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        { evaluacion },
        { message: 'Evaluación creada', statusCode: 201 },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error POST evaluación', { error: error.message });
      return next(error);
    }
  }
}
