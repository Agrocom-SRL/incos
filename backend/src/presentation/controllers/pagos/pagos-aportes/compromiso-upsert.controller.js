/**
 * POST /api/v1/pagos-aportes/:pagoAporteId/compromiso
 * Crea/reemplaza el compromiso de pago VIGENTE de una cabecera.
 *
 * Permiso: finanzas.pago.editar (CREAR).
 * Body: fecha_compromiso (req), observacion (opt).
 * Contrato: data.compromiso = compromiso vigente creado.
 */
export class UpsertCompromisoController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/UpsertCompromisoUseCase.js').UpsertCompromisoUseCase} params.upsertCompromisoUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ upsertCompromisoUseCase, logger, responseFormatter }) {
    this.upsertCompromisoUseCase = upsertCompromisoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'compromiso';
    this.resourceName = 'compromiso de pago';
  }

  async handle(req, res, next) {
    try {
      const pagoAporteId = req.params.pagoAporteId;
      const body = req.body || {};
      const userId = req.user?.id ?? null;

      const compromiso = await this.upsertCompromisoUseCase.execute({
        pagoAporteId,
        data: {
          fechaCompromiso: body.fecha_compromiso,
          observacion: body.observacion,
        },
        userId,
      });

      return this.responseFormatter.created(
        res,
        { [this.dataFieldName]: compromiso },
        this.resourceName,
        compromiso?.id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al crear compromiso de pago', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
