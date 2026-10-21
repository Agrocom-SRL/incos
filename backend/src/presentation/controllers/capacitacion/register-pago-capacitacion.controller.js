/**
 * POST /api/v1/inscripciones-capacitacion/:id/pagos
 * Registra un pago de una inscripción (permiso capacitacion.pago CREAR).
 * numero_recibo generado por lógica de negocio (ID a 6 dígitos). Acepta JSON o
 * multipart/form-data con el archivo opcional `comprobante` (imagen/PDF).
 */
export class RegisterPagoCapacitacionController {
  constructor({ registerPagoCapacitacionUseCase, logger, responseFormatter }) {
    this.registerPagoCapacitacionUseCase = registerPagoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const capacitacionInscritoId = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;

      this.logger.info('Request de registro de pago de capacitación', {
        capacitacionInscritoId,
        conComprobante: Boolean(req.file),
      });

      const result = await this.registerPagoCapacitacionUseCase.execute(
        capacitacionInscritoId,
        body,
        userId,
        { file: req.file ?? null }
      );
      const { pagoCapacitacion } = result;
      return this.responseFormatter.created(
        res,
        pagoCapacitacion,
        'pago de capacitación',
        pagoCapacitacion.id,
        req
      );
    } catch (error) {
      this.logger.error('Error al registrar pago de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
