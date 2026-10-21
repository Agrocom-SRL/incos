/**
 * GET /api/v1/cursos-capacitacion/horarios[?aulaId=X&excludeCursoId=Y&search=&sort=dia|hora|nombre[:desc]]
 * Catálogo de horarios de capacitación (tipo_horario='CAPACITACION') con
 * `cursosEnUso`; `ocupado` solo se calcula si viene aulaId. dataFieldName: 'horarios'.
 */
export class ListHorariosCapacitacionController {
  constructor({ listHorariosCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = listHorariosCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { aulaId, excludeCursoId, search, sort } = req.query;
      const result = await this.useCase.execute({ aulaId, excludeCursoId, search, sort });

      return this.responseFormatter._success(
        res,
        result,
        { statusCode: 200, message: 'Horarios de capacitación obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('Error al listar horarios de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
