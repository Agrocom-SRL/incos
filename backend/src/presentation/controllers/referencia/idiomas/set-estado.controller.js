export class SetEstadoIdiomaController {
  constructor({ setEstadoIdiomaUseCase, logger, responseFormatter }) {
    this.setEstadoIdiomaUseCase = setEstadoIdiomaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoIdiomaUseCase.execute(id, activo, userId);
      const { idioma } = result;
      return this.responseFormatter.updated(res, idioma, 'idioma', idioma.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
