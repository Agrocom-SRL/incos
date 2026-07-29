/**
 * PUT /api/v1/pasantias/:id/seguimientos/:seguimientoId (P17)
 * Edita un seguimiento del trámite. dataFieldName: 'seguimiento'.
 */
export class UpdateSeguimientoPasantiaController {
  constructor({ updateSeguimientoPasantiaUseCase, logger, responseFormatter }) {
    this.updateSeguimientoPasantiaUseCase = updateSeguimientoPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const seguimientoId = parseInt(req.params.seguimientoId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de edición de seguimiento', {
        pasantiaId,
        seguimientoId,
      });

      const result = await this.updateSeguimientoPasantiaUseCase.execute(
        pasantiaId,
        seguimientoId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.seguimiento,
        'seguimiento de pasantía',
        seguimientoId,
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al editar seguimiento', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
        seguimientoId: req.params?.seguimientoId,
      });
      return next(error);
    }
  }
}
