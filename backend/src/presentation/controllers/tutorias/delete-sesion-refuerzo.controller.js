/**
 * DELETE /api/v1/acompanamiento/sesiones/:id (A8)
 * Elimina (soft) una sesión de refuerzo.
 */
export class DeleteSesionRefuerzoController {
  constructor({ deleteSesionRefuerzoUseCase, logger, responseFormatter }) {
    this.deleteSesionRefuerzoUseCase = deleteSesionRefuerzoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de eliminación de sesión de refuerzo', { id });

      await this.deleteSesionRefuerzoUseCase.execute(id, userId);

      return this.responseFormatter.deleted(res, 'sesión de refuerzo', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al eliminar sesión de refuerzo', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
