/**
 * PUT /api/v1/pagos-aportes/compromiso/:id
 * Edita un compromiso de pago existente.
 *
 * Permiso: finanzas.pago.editar (EDITAR).
 * Body: fecha_compromiso?, observacion?, estado?
 * Contrato: data.compromiso = compromiso actualizado.
 */
export class UpdateCompromisoController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/UpdateCompromisoUseCase.js').UpdateCompromisoUseCase} params.updateCompromisoUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ updateCompromisoUseCase, logger, responseFormatter }) {
    this.updateCompromisoUseCase = updateCompromisoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'compromiso';
    this.resourceName = 'compromiso de pago';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;

      const compromiso = await this.updateCompromisoUseCase.execute(
        id,
        {
          fechaCompromiso: body.fecha_compromiso,
          observacion: body.observacion,
          estado: body.estado,
        },
        userId
      );

      return this.responseFormatter.updated(
        res,
        { [this.dataFieldName]: compromiso },
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al actualizar compromiso de pago', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
