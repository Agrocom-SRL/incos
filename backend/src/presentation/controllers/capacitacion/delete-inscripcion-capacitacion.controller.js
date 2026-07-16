/**
 * DELETE /api/v1/inscripciones-capacitacion/:id
 * Elimina (soft delete) una inscripción y sus pagos; la fila conserva la
 * semántica RETIRADO.
 */
export class DeleteInscripcionCapacitacionController {
  constructor({ deleteInscripcionCapacitacionUseCase, logger, responseFormatter }) {
    this.deleteInscripcionCapacitacionUseCase = deleteInscripcionCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deleteInscripcionCapacitacionUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'inscripción de capacitación', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
