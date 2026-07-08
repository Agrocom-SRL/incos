export class SetEstadoEstadoCivilController {
  constructor({ setEstadoEstadoCivilUseCase, logger, responseFormatter }) {
    this.setEstadoEstadoCivilUseCase = setEstadoEstadoCivilUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoEstadoCivilUseCase.execute(id, activo, userId);
      const { estadoCivil } = result;
      return this.responseFormatter.updated(res, estadoCivil, 'estado civil', estadoCivil.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
