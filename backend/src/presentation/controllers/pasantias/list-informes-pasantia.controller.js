/**
 * GET /api/v1/pasantias/:id/informes (P11)
 * Informes formales del trámite. dataFieldName: 'informes'.
 */
export class ListInformesPasantiaController {
  constructor({ listInformesPasantiaUseCase, logger, responseFormatter }) {
    this.listInformesPasantiaUseCase = listInformesPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      this.logger.info('[Pasantías] Request de informes del trámite', { pasantiaId });

      const data = await this.listInformesPasantiaUseCase.execute(pasantiaId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Informes de la pasantía obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al listar informes del trámite', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
