export class GetGestionBimestresController {
  constructor({ getGestionBimestresUseCase, logger, responseFormatter }) {
    this.getGestionBimestresUseCase = getGestionBimestresUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getGestionBimestresUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Gestión de bimestres obtenida correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error GET gestión bimestres', {
        error: error.message,
      });
      return next(error);
    }
  }
}
