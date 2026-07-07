export class UpdateAulaController {
  constructor({ updateAulaUseCase, logger, responseFormatter }) {
    this.updateAulaUseCase = updateAulaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateAulaUseCase.execute(id, body, userId);
      const { aula } = result;
      return this.responseFormatter.updated(res, aula, 'aula', aula.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
