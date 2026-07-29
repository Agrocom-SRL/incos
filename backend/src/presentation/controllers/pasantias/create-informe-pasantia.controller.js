/**
 * POST /api/v1/pasantias/:id/informes (P12)
 * Emite un informe del trámite y genera su PDF institucional.
 * dataFieldName: 'informe'.
 */
export class CreateInformePasantiaController {
  constructor({ createInformePasantiaUseCase, logger, responseFormatter }) {
    this.createInformePasantiaUseCase = createInformePasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de emisión de informe', {
        pasantiaId,
        tipo: req.body?.tipo,
      });

      const result = await this.createInformePasantiaUseCase.execute(
        pasantiaId,
        req.body || {},
        userId
      );

      return this.responseFormatter.created(
        res,
        result.informe,
        'informe de pasantía',
        result.informe?.id ?? 'nuevo',
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al emitir informe', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
