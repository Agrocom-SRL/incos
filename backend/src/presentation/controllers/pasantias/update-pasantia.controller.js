/**
 * PUT /api/v1/pasantias/:id (P4)
 * Actualiza datos del trámite. dataFieldName: 'pasantia'.
 */
export class UpdatePasantiaController {
  constructor({ updatePasantiaUseCase, logger, responseFormatter }) {
    this.updatePasantiaUseCase = updatePasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de actualización de trámite', { id });

      const result = await this.updatePasantiaUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(res, result.pasantia, 'pasantía', id, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error al actualizar trámite', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
