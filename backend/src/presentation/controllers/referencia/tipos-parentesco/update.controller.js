export class UpdateTipoParentescoController {
  constructor({ updateTipoParentescoUseCase, logger, responseFormatter }) {
    this.updateTipoParentescoUseCase = updateTipoParentescoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateTipoParentescoUseCase.execute(id, body, userId);
      const { tipoParentesco } = result;
      return this.responseFormatter.updated(res, tipoParentesco, 'tipo de parentesco', tipoParentesco.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
