/**
 * GET /api/v1/nivelaciones/pendientes-por-paralelo
 */
export class ListPendientesNivelacionParaleloController {
  constructor({ listPendientesNivelacionParaleloUseCase, logger, responseFormatter }) {
    this.listPendientesNivelacionParaleloUseCase = listPendientesNivelacionParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.listPendientesNivelacionParaleloUseCase.execute();

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Pendientes de nivelación por paralelo obtenidos correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error pendientes por paralelo', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default ListPendientesNivelacionParaleloController;
