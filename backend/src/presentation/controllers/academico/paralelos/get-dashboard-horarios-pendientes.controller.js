export class GetDashboardHorariosPendientesController {
  constructor({ getHorariosSidebarPendientesUseCase, logger, responseFormatter }) {
    this.useCase = getHorariosSidebarPendientesUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute();
      return this.responseFormatter._success(res, data, { message: 'Pendientes de horarios obtenidos correctamente' }, req);
    } catch (error) {
      this.logger.error('Error al obtener pendientes de horarios del dashboard', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
