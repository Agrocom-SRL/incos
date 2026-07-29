/**
 * POST /api/v1/pasantias/:id/seguimientos (P16)
 * Registra un seguimiento del trámite. dataFieldName: 'seguimiento'.
 */
export class CreateSeguimientoPasantiaController {
  constructor({ createSeguimientoPasantiaUseCase, logger, responseFormatter }) {
    this.createSeguimientoPasantiaUseCase = createSeguimientoPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de registro de seguimiento', {
        pasantiaId,
        fecha: req.body?.fecha,
      });

      const result = await this.createSeguimientoPasantiaUseCase.execute(
        pasantiaId,
        req.body || {},
        userId
      );

      return this.responseFormatter.created(
        res,
        result.seguimiento,
        'seguimiento de pasantía',
        result.seguimiento?.id ?? 'nuevo',
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al registrar seguimiento', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
