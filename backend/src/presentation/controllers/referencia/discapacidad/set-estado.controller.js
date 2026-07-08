export class SetEstadoDiscapacidadController {
  constructor({ setEstadoDiscapacidadUseCase, logger, responseFormatter }) {
    this.setEstadoDiscapacidadUseCase = setEstadoDiscapacidadUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoDiscapacidadUseCase.execute(id, activo, userId);
      const { discapacidad } = result;
      return this.responseFormatter.updated(
        res,
        discapacidad,
        'tipo de discapacidad',
        discapacidad.id,
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}
