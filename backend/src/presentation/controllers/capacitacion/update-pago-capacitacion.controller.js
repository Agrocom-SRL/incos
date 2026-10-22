/**
 * PUT /api/v1/inscripciones-capacitacion/:id/pagos/:pagoId
 * Corrige un pago registrado (permiso capacitacion.inscripcion EDITAR). La respuesta
 * tiene la misma forma que POST /:id/pagos: el pago con `inscripcion` (estados y
 * saldos recalculados).
 */
export class UpdatePagoCapacitacionController {
  constructor({ updatePagoCapacitacionUseCase, logger, responseFormatter }) {
    this.updatePagoCapacitacionUseCase = updatePagoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const inscripcionId = parseInt(req.params.id, 10);
      const pagoId = parseInt(req.params.pagoId, 10);
      const userId = req.usuario?.id ?? null;
      const { pagoCapacitacion } = await this.updatePagoCapacitacionUseCase.execute(
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
      this.logger.error('Error al corregir pago de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
