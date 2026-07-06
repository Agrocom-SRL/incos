export class UpdateIdiomaController {
  constructor({ updateIdiomaUseCase, logger, responseFormatter }) {
    this.updateIdiomaUseCase = updateIdiomaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateIdiomaUseCase.execute(id, body, userId);
      const idioma = result.idioma;
      return this.responseFormatter.updated(res, idioma, 'idioma', idioma.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
