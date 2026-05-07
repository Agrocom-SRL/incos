export class GetDashboardAsignaturasSinCursoController {
  constructor({ getAsignaturasSinCursoDashboardUseCase, logger, responseFormatter }) {
    this.useCase = getAsignaturasSinCursoDashboardUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute();
      return this.responseFormatter._success(res, data, { message: 'Asignaturas sin curso obtenidas correctamente' }, req);
    } catch (error) {
      this.logger.error('Error al obtener asignaturas sin curso del dashboard', { error: error.message, stack: error.stack });
      return next(error);
    }
  }
}
