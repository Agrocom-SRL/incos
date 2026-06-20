/**
 * GET /api/v1/pagos-aportes/:pagoAporteId/compromiso
 * Compromiso de pago VIGENTE de una cabecera (o null).
 *
 * Permiso: finanzas.pago.ver (lectura).
 * Contrato: data.compromiso = compromiso vigente | null.
 */
export class GetCompromisoController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/GetCompromisoByPagoAporteUseCase.js').GetCompromisoByPagoAporteUseCase} params.getCompromisoByPagoAporteUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ getCompromisoByPagoAporteUseCase, logger, responseFormatter }) {
    this.getCompromisoByPagoAporteUseCase = getCompromisoByPagoAporteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'compromiso';
    this.resourceName = 'compromiso de pago';
  }

  async handle(req, res, next) {
    try {
      const pagoAporteId = req.params.pagoAporteId;
      const compromiso = await this.getCompromisoByPagoAporteUseCase.execute({ pagoAporteId });
      return this.responseFormatter.retrieved(
        res,
        { [this.dataFieldName]: compromiso },
        this.resourceName,
        pagoAporteId,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al obtener compromiso de pago', {
        error: error.message,
        params: req.params,
      });
      return next(error);
    }
  }
}
