/**
 * GET /api/v1/acompanamiento/panel?gestionId= (A10)
 * Panel de acompañamiento (vistas 157/158/162 + top de la 156).
 * dataFieldName: 'panelAcompanamiento'.
 */
export class GetPanelAcompanamientoController {
  constructor({ getPanelAcompanamientoUseCase, logger, responseFormatter }) {
    this.getPanelAcompanamientoUseCase = getPanelAcompanamientoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      this.logger.info('[Acompañamiento] Request de panel de acompañamiento', {
        gestionId: req.query?.gestionId,
      });

      const data = await this.getPanelAcompanamientoUseCase.execute(req.query || {});

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Panel de acompañamiento obtenido correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Acompañamiento] Error al obtener panel de acompañamiento', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
