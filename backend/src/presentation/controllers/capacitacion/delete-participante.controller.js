/**
 * DELETE /api/v1/participantes/:id
 * Elimina (soft delete) un participante en cascada: sus inscripciones y pagos y,
 * al final, el participante.
 */
export class DeleteParticipanteController {
  constructor({ deleteParticipanteUseCase, logger, responseFormatter }) {
    this.deleteParticipanteUseCase = deleteParticipanteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deleteParticipanteUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'participante', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
