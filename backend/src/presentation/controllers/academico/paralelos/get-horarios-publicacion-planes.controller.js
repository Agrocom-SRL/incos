export class GetHorariosPublicacionPlanesController {
  constructor({ getHorariosPublicacionPlanesUseCase, logger, responseFormatter }) {
    this.useCase = getHorariosPublicacionPlanesUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const filters = {
        ...(req.query.carrera_id ? { carrera_id: req.query.carrera_id } : {}),
        ...(req.query.turno ? { turno: req.query.turno } : {}),
        ...(req.query.periodo ? { periodo: req.query.periodo } : {}),
      };
      const data = await this.useCase.execute(filters);
      return this.responseFormatter._success(res, data, { message: 'Planes de publicación obtenidos correctamente' }, req);
    } catch (error) {
      this.logger.error('Error al obtener planes de publicación de horarios', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
