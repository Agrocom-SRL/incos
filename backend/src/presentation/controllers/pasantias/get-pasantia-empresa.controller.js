/**
 * GET /api/v1/pasantias/empresas/:empresaId (P20)
 * Ficha de una empresa del catálogo. dataFieldName: 'pasantiaEmpresa'.
 *
 * NO extiende BaseGetController: ese controller asume el param de ruta `:id`
 * (parseInt(req.params.id)), pero esta ruta usa `:empresaId` — mismo motivo
 * por el que Update/DeletePasantiaEmpresaController tampoco lo extienden.
 */
export class GetPasantiaEmpresaController {
  constructor({ getPasantiaEmpresaUseCase, logger, responseFormatter }) {
    this.getPasantiaEmpresaUseCase = getPasantiaEmpresaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const empresaId = parseInt(req.params.empresaId, 10);
      this.logger.info('[Pasantías] Request de ficha de empresa', { empresaId });

      const pasantiaEmpresa = await this.getPasantiaEmpresaUseCase.execute(empresaId);

      return this.responseFormatter.retrieved(
        res,
        { pasantiaEmpresa },
        'empresa de pasantía',
        empresaId,
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al obtener ficha de empresa', {
        error: error.message,
        stack: error.stack,
        empresaId: req.params?.empresaId,
      });
      return next(error);
    }
  }
}
