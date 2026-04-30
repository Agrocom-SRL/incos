export class GetDashboardCapacidadTurnoController {
  constructor({ getCapacidadTurnoDashboardUseCase, logger, responseFormatter }) {
    this.useCase = getCapacidadTurnoDashboardUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute();
      return this.responseFormatter._success(res, data, { message: 'Capacidad por turno obtenida correctamente' }, req);
    } catch (error) {
      this.logger.error('Error al obtener capacidad por turno del dashboard', { error: error.message, stack: error.stack });
      return next(error);
    }
  }
}
