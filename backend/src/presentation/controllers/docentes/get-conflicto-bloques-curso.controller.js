/**
 * GET /api/v1/docentes/conflicto-bloques?cursoId=X
 */

export class GetDocentesConflictoBloquesController {
  constructor({ getDocentesConflictoBloquesCursoUseCase, logger, responseFormatter }) {
    this.useCase = getDocentesConflictoBloquesCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const cursoId = parseInt(String(req.query.cursoId), 10);
      const result = await this.useCase.execute(cursoId);
      return this.responseFormatter._success(res, result, {
        statusCode: 200,
        message: 'Conflicto de bloques obtenido correctamente',
      }, req);
    } catch (error) {
      this.logger.error('Error al obtener conflicto de bloques (docentes)', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
