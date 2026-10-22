/**
 * GET /api/v1/inscripciones-capacitacion/:id/pagos/:pagoId/recibo-pdf
 * Descarga el PDF del Recibo de Pago de un pago de una inscripción de capacitación.
 *
 * Permiso: capacitacion.inscripcion DETALLE.
 */
export class ExportReciboPagoCapacitacionController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/capacitacion/ExportReciboPagoCapacitacionPdfUseCase.js').ExportReciboPagoCapacitacionPdfUseCase} params.exportReciboPagoCapacitacionPdfUseCase
   * @param {Object} params.logger
   */
  constructor({ exportReciboPagoCapacitacionPdfUseCase, logger }) {
    if (!exportReciboPagoCapacitacionPdfUseCase) {
      throw new Error('exportReciboPagoCapacitacionPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportReciboPagoCapacitacionPdfUseCase = exportReciboPagoCapacitacionPdfUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const { id: inscripcionId, pagoId } = req.params;

      this.logger.info('[Capacitación] Request recibo de pago PDF', { inscripcionId, pagoId });

      const { buffer, fileName, mimeType } =
        await this.exportReciboPagoCapacitacionPdfUseCase.execute({ inscripcionId, pagoId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Capacitación] Error al exportar recibo de pago PDF', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportReciboPagoCapacitacionController;
