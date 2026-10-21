/**
 * PUT /api/v1/cursos-capacitacion/horarios/:id
 * Edita día, horas y nombre de un horario de capacitación. dataFieldName: 'horario'.
 */
export class UpdateHorarioCapacitacionController {
  constructor({ updateHorarioCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = updateHorarioCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const { horario } = await this.useCase.execute(id, req.body || {}, userId);
      return this.responseFormatter.updated(res, { horario }, 'horario de capacitación', id, req);
    } catch (error) {
      this.logger.error('Error al actualizar horario de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
