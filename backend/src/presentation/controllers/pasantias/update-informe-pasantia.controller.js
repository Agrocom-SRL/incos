/**
 * PUT /api/v1/pasantias/:id/informes/:informeId (P13)
 * Edita un informe del trámite (regenera su PDF). dataFieldName: 'informe'.
 */
export class UpdateInformePasantiaController {
  constructor({ updateInformePasantiaUseCase, logger, responseFormatter }) {
    this.updateInformePasantiaUseCase = updateInformePasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const informeId = parseInt(req.params.informeId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de edición de informe', { pasantiaId, informeId });

      const result = await this.updateInformePasantiaUseCase.execute(
        pasantiaId,
        informeId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.informe,
        'informe de pasantía',
        informeId,
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al editar informe', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
        informeId: req.params?.informeId,
      });
      return next(error);
    }
  }
}
