/**
 * DELETE /api/v1/cursos-capacitacion/:id
 * Elimina (soft delete) un curso de capacitación. Bloquea si tiene
 * inscripciones vigentes.
 */
export class DeleteCursoCapacitacionController {
  constructor({ deleteCursoCapacitacionUseCase, logger, responseFormatter }) {
    this.deleteCursoCapacitacionUseCase = deleteCursoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deleteCursoCapacitacionUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'curso de capacitación', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
