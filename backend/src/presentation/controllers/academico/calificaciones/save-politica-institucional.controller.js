/**
 * PUT /api/v1/calificaciones/politica
 */

export class SavePoliticaInstitucionalController {
  constructor({ savePoliticaInstitucionalUseCase, logger, responseFormatter }) {
    this.savePoliticaInstitucionalUseCase = savePoliticaInstitucionalUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const userId = req.user?.id ?? null;
      const payload = await this.savePoliticaInstitucionalUseCase.execute(req.body, userId);
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Configuración de notas guardada correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error PUT política', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
