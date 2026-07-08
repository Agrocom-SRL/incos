export class UpdateActividadController {
  constructor({ updateActividadUseCase, logger, responseFormatter }) {
    this.updateActividadUseCase = updateActividadUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateActividadUseCase.execute(id, body, userId);
      const { actividad } = result;
      return this.responseFormatter.updated(res, actividad, 'actividad', actividad.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
