export class SetEstadoParaleloController {
  constructor({ setEstadoParaleloUseCase, logger, responseFormatter }) {
    this.setEstadoParaleloUseCase = setEstadoParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoParaleloUseCase.execute(id, activo, userId);
      const { paralelo } = result;
      return this.responseFormatter.updated(res, paralelo, 'paralelo', paralelo.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
