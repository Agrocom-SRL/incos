export class SetEstadoActividadController {
  constructor({ setEstadoActividadUseCase, logger, responseFormatter }) {
    this.setEstadoActividadUseCase = setEstadoActividadUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoActividadUseCase.execute(id, activo, userId);
      const { actividad } = result;
      return this.responseFormatter.updated(res, actividad, 'actividad', actividad.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
