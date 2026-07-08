/**
 * POST /api/v1/cuentas-pago
 * Crea una cuenta de pago. Acepta multipart con archivo opcional `qr`.
 *
 * Permiso: finanzas.configuracion.pago (CREAR).
 * Body: metodo_pago_id?, banco_id?, nombre_titular (req), numero_cuenta?,
 *       numero_celular?, qr_imagen_url?, activo?  +  archivo `qr` (opcional).
 * Contrato: data.cuentaPago = cuenta creada.
 */
export class CreateCuentaPagoController {
  constructor({ createPaymentAccountUseCase, logger, responseFormatter }) {
    this.createPaymentAccountUseCase = createPaymentAccountUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'cuentaPago';
    this.resourceName = 'cuenta de pago';
  }

  async handle(req, res, next) {
    try {
      const userId = req.usuario?.id ?? null;
      const cuenta = await this.createPaymentAccountUseCase.execute({
        body: req.body || {},
        qrFile: req.file ?? null,
        userId,
      });

      return this.responseFormatter.created(
        res,
        { [this.dataFieldName]: cuenta },
        this.resourceName,
        cuenta?.id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al crear cuenta de pago', {
        error: error.message,
        body: req.body,
      });
      return next(error);
    }
  }
}
