/**
 * GET /api/v1/calificaciones/politica/catalogo
 */

export class GetPoliticaCatalogoController {
  constructor({ getPoliticaCatalogoUseCase, logger, responseFormatter }) {
    this.getPoliticaCatalogoUseCase = getPoliticaCatalogoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getPoliticaCatalogoUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Catálogo de política obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error GET catálogo política', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
