/**
 * DELETE /api/v1/acompanamiento/sesiones/:id (A8)
 * Elimina (soft) una sesión de reforzamiento.
 */
export class DeleteSesionReforzamientoController {
  constructor({ deleteSesionReforzamientoUseCase, logger, responseFormatter }) {
    this.deleteSesionReforzamientoUseCase = deleteSesionReforzamientoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de eliminación de sesión de reforzamiento', { id });

      await this.deleteSesionReforzamientoUseCase.execute(id, userId);

      return this.responseFormatter.deleted(res, 'sesión de reforzamiento', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al eliminar sesión de reforzamiento', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
