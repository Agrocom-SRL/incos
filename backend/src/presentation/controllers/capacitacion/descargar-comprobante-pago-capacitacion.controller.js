/**
 * GET /api/v1/inscripciones-capacitacion/:id/pagos/:pagoId/comprobante
 * Descarga autenticada del comprobante (res.download; nunca URL estática /uploads).
 */
export class DescargarComprobantePagoCapacitacionController {
  constructor({ descargarComprobantePagoCapacitacionUseCase, logger }) {
    this.useCase = descargarComprobantePagoCapacitacionUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { absolutePath, fileName } = await this.useCase.execute({
        inscripcionId: parseInt(req.params.id, 10),
        pagoId: parseInt(req.params.pagoId, 10),
      });
      return res.download(absolutePath, fileName);
    } catch (error) {
      this.logger.error('Error al descargar comprobante de pago de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
