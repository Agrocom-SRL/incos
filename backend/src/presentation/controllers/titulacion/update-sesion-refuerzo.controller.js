/**
 * PUT /api/v1/acompanamiento/sesiones/:id (A7)
 * Actualiza una sesión de refuerzo. dataFieldName: 'sesionRefuerzo'.
 */
export class UpdateSesionRefuerzoController {
  constructor({ updateSesionRefuerzoUseCase, logger, responseFormatter }) {
    this.updateSesionRefuerzoUseCase = updateSesionRefuerzoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de actualización de sesión de refuerzo', { id });

      const result = await this.updateSesionRefuerzoUseCase.execute(
        id,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.sesionRefuerzo,
        'sesión de refuerzo',
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al actualizar sesión de refuerzo', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
