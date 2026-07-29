/**
 * GET /api/v1/pasantias/:id/seguimientos (P15)
 * Seguimientos del trámite (orden cronológico). dataFieldName: 'seguimientos'.
 */
export class ListSeguimientosPasantiaController {
  constructor({ listSeguimientosPasantiaUseCase, logger, responseFormatter }) {
    this.listSeguimientosPasantiaUseCase = listSeguimientosPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      this.logger.info('[Pasantías] Request de seguimientos del trámite', { pasantiaId });

      const data = await this.listSeguimientosPasantiaUseCase.execute(pasantiaId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Seguimientos de la pasantía obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al listar seguimientos del trámite', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
