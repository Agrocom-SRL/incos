/**
 * GET /api/v1/cursos-capacitacion/horarios-disponibles?aulaId=X&excludeCursoId=Y
 * Bloques del catálogo `horarios` (tipo_horario='CLASES') con flag `ocupado`
 * calculado para el aula indicada. dataFieldName: 'horarios'.
 */
export class ListHorariosDisponiblesCapacitacionController {
  constructor({ listHorariosDisponiblesCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = listHorariosDisponiblesCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { aulaId, excludeCursoId } = req.query;
      const result = await this.useCase.execute({
        aulaId,
        excludeCursoId: excludeCursoId ?? null,
      });

      return this.responseFormatter._success(
        res,
        result,
        {
          statusCode: 200,
          message: 'Horarios disponibles obtenidos correctamente',
        },
        req
      );
    } catch (error) {
      this.logger.error('Error al obtener horarios disponibles de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
