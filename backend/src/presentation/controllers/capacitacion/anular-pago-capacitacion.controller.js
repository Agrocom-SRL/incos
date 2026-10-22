/**
 * POST /api/v1/inscripciones-capacitacion/:id/pagos/:pagoId/anular
 * Anula un pago equivocado conservando el historial (permiso capacitacion.inscripcion
 * EDITAR). Body: { motivo } obligatorio. Misma forma de respuesta que POST /:id/pagos.
 */
export class AnularPagoCapacitacionController {
  constructor({ anularPagoCapacitacionUseCase, logger, responseFormatter }) {
    this.anularPagoCapacitacionUseCase = anularPagoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const inscripcionId = parseInt(req.params.id, 10);
      const pagoId = parseInt(req.params.pagoId, 10);
      const userId = req.usuario?.id ?? null;
      const { pagoCapacitacion } = await this.anularPagoCapacitacionUseCase.execute(
        inscripcionId,
        pagoId,
        req.body || {},
        userId
      );
      return this.responseFormatter.updated(
        res,
        pagoCapacitacion,
        'pago de capacitación',
        pagoCapacitacion.id,
        req
      );
    } catch (error) {
      this.logger.error('Error al anular pago de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
