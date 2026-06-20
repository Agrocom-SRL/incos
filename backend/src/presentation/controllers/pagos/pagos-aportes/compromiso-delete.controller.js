/**
 * DELETE /api/v1/pagos-aportes/compromiso/:id
 * Elimina (soft delete) un compromiso de pago.
 *
 * Permiso: finanzas.pago.editar (ELIMINAR).
 */
export class DeleteCompromisoController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/DeleteCompromisoUseCase.js').DeleteCompromisoUseCase} params.deleteCompromisoUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ deleteCompromisoUseCase, logger, responseFormatter }) {
    this.deleteCompromisoUseCase = deleteCompromisoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.resourceName = 'compromiso de pago';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deleteCompromisoUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, this.resourceName, id, req);
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar compromiso de pago', {
        error: error.message,
        params: req.params,
      });
      return next(error);
    }
  }
}
