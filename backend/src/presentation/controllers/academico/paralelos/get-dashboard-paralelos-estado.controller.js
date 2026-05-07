export class GetDashboardParalelosEstadoController {
  constructor({ getParalelosEstadoDashboardUseCase, logger, responseFormatter }) {
    this.useCase = getParalelosEstadoDashboardUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const filters = {
        ...(req.query.carrera_id ? { carrera_id: req.query.carrera_id } : {}),
        ...(req.query.turno ? { turno: req.query.turno } : {}),
      };
      const data = await this.useCase.execute(filters);
      return this.responseFormatter._success(res, data, { message: 'Estado de paralelos obtenido correctamente' }, req);
    } catch (error) {
      this.logger.error('Error al obtener estado de paralelos del dashboard', { error: error.message, stack: error.stack });
      return next(error);
    }
  }
}
