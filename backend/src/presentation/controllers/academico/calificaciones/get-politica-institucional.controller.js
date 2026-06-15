/**
 * GET /api/v1/calificaciones/politica
 */

export class GetPoliticaInstitucionalController {
  constructor({ getPoliticaInstitucionalUseCase, logger, responseFormatter }) {
    this.getPoliticaInstitucionalUseCase = getPoliticaInstitucionalUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getPoliticaInstitucionalUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Configuración de notas obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error GET política', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
