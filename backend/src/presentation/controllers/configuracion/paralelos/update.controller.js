export class UpdateParaleloController {
  constructor({ updateParaleloUseCase, logger, responseFormatter }) {
    this.updateParaleloUseCase = updateParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateParaleloUseCase.execute(id, body, userId);
      const paralelo = result.paralelo;
      return this.responseFormatter.updated(res, paralelo, 'paralelo', paralelo.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
