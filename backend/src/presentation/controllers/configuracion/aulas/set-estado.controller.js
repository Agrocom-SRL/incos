export class SetEstadoAulaController {
  constructor({ setEstadoAulaUseCase, logger, responseFormatter }) {
    this.setEstadoAulaUseCase = setEstadoAulaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoAulaUseCase.execute(id, activo, userId);
      const { aula } = result;
      return this.responseFormatter.updated(res, aula, 'aula', aula.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
