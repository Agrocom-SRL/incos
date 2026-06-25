/**
 * GET /api/v1/calificaciones/centralizador?paraleloGestionId=<entero>
 */

export class GetCentralizadorParaleloController {
  /**
   * @param {Object} params
   * @param {Object} params.getCentralizadorParaleloUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getCentralizadorParaleloUseCase, logger, responseFormatter }) {
    this.getCentralizadorParaleloUseCase = getCentralizadorParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  /**
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async handle(req, res, next) {
    try {
      const paraleloGestionId = parseInt(req.query.paraleloGestionId, 10);

      this.logger.info('[Calificaciones] Centralizador por paralelo', {
        paraleloGestionId,
      });

      const payload = await this.getCentralizadorParaleloUseCase.execute({
        paraleloGestionId,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Centralizador de calificaciones obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error centralizador por paralelo', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
