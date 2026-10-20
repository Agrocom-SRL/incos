export class UpdateCarreraController {
  constructor({ updateCarreraUseCase, logger, responseFormatter }) {
    this.updateCarreraUseCase = updateCarreraUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateCarreraUseCase.execute(id, body, userId);
      const carrera = result.carrera;
      return this.responseFormatter.updated(res, carrera, 'carrera', carrera.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
