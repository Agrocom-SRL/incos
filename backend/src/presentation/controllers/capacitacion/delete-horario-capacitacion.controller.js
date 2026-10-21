/**
 * DELETE /api/v1/cursos-capacitacion/horarios/:id
 * Elimina (soft delete) un horario de capacitación; 409 con detalle si lo usa
 * algún curso activo.
 */
export class DeleteHorarioCapacitacionController {
  constructor({ deleteHorarioCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = deleteHorarioCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.useCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'horario de capacitación', id, req);
    } catch (error) {
      this.logger.error('Error al eliminar horario de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
