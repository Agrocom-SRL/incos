/**
 * GET /api/v1/docentes/cursos/:cursoId/horarios
 */

export class GetCursoHorariosDocenteController {
  constructor({ getCursoHorariosDocenteUseCase, logger, responseFormatter }) {
    this.useCase = getCursoHorariosDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const cursoId = parseInt(String(req.params.cursoId), 10);
      const result = await this.useCase.execute(cursoId);

      return this.responseFormatter._success(res, result, {
        statusCode: 200,
        message: 'Horarios del curso obtenidos correctamente',
      }, req);
    } catch (error) {
      this.logger.error('Error al obtener horarios del curso (docentes)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
