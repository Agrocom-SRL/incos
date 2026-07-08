export class SetEstadoTipoEvaluacionController {
  constructor({ setEstadoTipoEvaluacionUseCase, logger, responseFormatter }) {
    this.setEstadoTipoEvaluacionUseCase = setEstadoTipoEvaluacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoTipoEvaluacionUseCase.execute(id, activo, userId);
      const { tipoEvaluacion } = result;
      return this.responseFormatter.updated(
        res,
        tipoEvaluacion,
        'tipoEvaluacion',
        tipoEvaluacion.id,
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}
