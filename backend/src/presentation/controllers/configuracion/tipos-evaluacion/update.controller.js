export class UpdateTipoEvaluacionController {
  constructor({ updateTipoEvaluacionUseCase, logger, responseFormatter }) {
    this.updateTipoEvaluacionUseCase = updateTipoEvaluacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateTipoEvaluacionUseCase.execute(id, body, userId);
      const { tipoEvaluacion } = result;
      return this.responseFormatter.updated(res, tipoEvaluacion, 'tipoEvaluacion', tipoEvaluacion.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
