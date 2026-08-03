/**
 * DELETE /api/v1/pasantias/:id (P5)
 * Elimina (soft) el trámite de pasantía.
 */
export class DeletePasantiaController {
  constructor({ deletePasantiaUseCase, logger, responseFormatter }) {
    this.deletePasantiaUseCase = deletePasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de eliminación de trámite', { id });

      await this.deletePasantiaUseCase.execute(id, userId);

      return this.responseFormatter.deleted(res, 'pasantía', id, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error al eliminar trámite', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
