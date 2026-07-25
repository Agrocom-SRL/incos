/**
 * PUT /api/v1/acompanamiento/sesiones/:id (A7)
 * Actualiza una sesión de reforzamiento. dataFieldName: 'sesionReforzamiento'.
 */
export class UpdateSesionReforzamientoController {
  constructor({ updateSesionReforzamientoUseCase, logger, responseFormatter }) {
    this.updateSesionReforzamientoUseCase = updateSesionReforzamientoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de actualización de sesión de reforzamiento', { id });

      const result = await this.updateSesionReforzamientoUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(
        res,
        result.sesionReforzamiento,
        'sesión de reforzamiento',
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al actualizar sesión de reforzamiento', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
