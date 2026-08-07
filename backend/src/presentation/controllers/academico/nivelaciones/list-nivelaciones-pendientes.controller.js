/**
 * GET /api/v1/nivelaciones/pendientes — bandeja plana PROGRAMADA/EN_CURSO.
 */
export class ListNivelacionesPendientesController {
  constructor({ listNivelacionesPendientesUseCase, logger, responseFormatter }) {
    this.listNivelacionesPendientesUseCase = listNivelacionesPendientesUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.listNivelacionesPendientesUseCase.execute();

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Bandeja de nivelaciones pendientes obtenida correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error bandeja de pendientes', { error: error.message });
      return next(error);
    }
  }
}

export default ListNivelacionesPendientesController;
