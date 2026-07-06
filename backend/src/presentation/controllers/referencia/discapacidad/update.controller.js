export class UpdateDiscapacidadController {
  constructor({ updateDiscapacidadUseCase, logger, responseFormatter }) {
    this.updateDiscapacidadUseCase = updateDiscapacidadUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateDiscapacidadUseCase.execute(id, body, userId);
      const discapacidad = result.discapacidad;
      return this.responseFormatter.updated(res, discapacidad, 'tipo de discapacidad', discapacidad.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
