/**
 * GET /api/v1/cursos-capacitacion/horarios/:id
 * Ficha de un horario de capacitación con los cursos que lo usan.
 * dataFieldName: 'horario'.
 */
export class GetHorarioCapacitacionController {
  constructor({ getHorarioCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = getHorarioCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const horario = await this.useCase.execute(id);
      return this.responseFormatter.retrieved(res, { horario }, 'horario de capacitación', id, req);
    } catch (error) {
      this.logger.error('Error al obtener horario de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
