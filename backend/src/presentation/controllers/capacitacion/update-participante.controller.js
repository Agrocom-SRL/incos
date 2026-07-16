/**
 * PUT /api/v1/participantes/:id
 * Actualiza un participante (revalida unicidad CI+expedición si cambian).
 */
export class UpdateParticipanteController {
  constructor({ updateParticipanteUseCase, logger, responseFormatter }) {
    this.updateParticipanteUseCase = updateParticipanteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateParticipanteUseCase.execute(id, body, userId);
      const { participante } = result;
      return this.responseFormatter.updated(res, participante, 'participante', participante.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
