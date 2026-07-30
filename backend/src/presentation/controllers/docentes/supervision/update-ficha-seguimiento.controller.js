/**
 * PUT /api/v1/supervision-docente/:id (S4)
 * Actualiza la ficha de seguimiento (el evaluador NO se reasigna por PUT).
 * Permiso: docentes.supervision.ficha EDITAR. dataFieldName: 'fichaSeguimiento'.
 */
export class UpdateFichaSeguimientoController {
  constructor({ updateFichaSeguimientoUseCase, logger, responseFormatter }) {
    this.updateFichaSeguimientoUseCase = updateFichaSeguimientoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Supervisión docente] Request de actualización de ficha', { id });

      const result = await this.updateFichaSeguimientoUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(
        res,
        result.fichaSeguimiento,
        'ficha de seguimiento',
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Supervisión docente] Error al actualizar ficha', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
