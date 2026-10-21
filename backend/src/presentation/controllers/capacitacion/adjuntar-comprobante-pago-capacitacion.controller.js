/**
 * POST /api/v1/inscripciones-capacitacion/:id/pagos/:pagoId/comprobante
 * Adjunta o reemplaza el comprobante de un pago (multipart, campo `comprobante`).
 * dataFieldName: 'pagoCapacitacion'.
 */
export class AdjuntarComprobantePagoCapacitacionController {
  constructor({ adjuntarComprobantePagoCapacitacionUseCase, logger, responseFormatter }) {
    this.useCase = adjuntarComprobantePagoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const pagoId = parseInt(req.params.pagoId, 10);
      const { pagoCapacitacion } = await this.useCase.execute({
        inscripcionId: parseInt(req.params.id, 10),
        pagoId,
        file: req.file,
        userId: req.usuario?.id ?? null,
      });

      return this.responseFormatter.updated(
        res,
        { pagoCapacitacion },
        'comprobante del pago',
        pagoId,
        req
      );
    } catch (error) {
      this.logger.error('Error al adjuntar comprobante de pago de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
