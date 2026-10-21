/**
 * POST /api/v1/cursos-capacitacion/horarios
 * Find-or-create de un horario de capacitación: 201 si se creó, 200 si ya existía.
 * dataFieldName: 'horario'.
 */
export class CreateHorarioCapacitacionController {
  constructor({ createHorarioCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = createHorarioCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const userId = req.usuario?.id ?? null;
      const { horario, creado } = await this.useCase.execute(req.body || {}, userId);
      const data = { horario };

      if (creado) {
        return this.responseFormatter.created(
          res,
          data,
          'horario de capacitación',
          horario.horarioId,
          req
        );
      }
      return this.responseFormatter.retrieved(
        res,
        data,
        'horario de capacitación',
        horario.horarioId,
        req
      );
    } catch (error) {
      this.logger.error('Error al crear horario de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
