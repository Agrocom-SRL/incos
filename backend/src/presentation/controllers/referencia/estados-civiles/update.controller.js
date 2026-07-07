export class UpdateEstadoCivilController {
  constructor({ updateEstadoCivilUseCase, logger, responseFormatter }) {
    this.updateEstadoCivilUseCase = updateEstadoCivilUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateEstadoCivilUseCase.execute(id, body, userId);
      const { estadoCivil } = result;
      return this.responseFormatter.updated(res, estadoCivil, 'estado civil', estadoCivil.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
