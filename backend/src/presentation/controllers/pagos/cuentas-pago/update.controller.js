/**
 * PUT /api/v1/cuentas-pago/:id
 * Edita una cuenta de pago. Acepta multipart con archivo opcional `qr`.
 *
 * Permiso: configuracion.pagos (EDITAR).
 * Body: metodo_pago_id?, banco_id?, nombre_titular?, numero_cuenta?,
 *       numero_celular?, qr_imagen_url?, activo?  +  archivo `qr` (opcional).
 * Contrato: data.cuentaPago = cuenta actualizada.
 */
export class UpdateCuentaPagoController {
  constructor({ updatePaymentAccountUseCase, logger, responseFormatter }) {
    this.updatePaymentAccountUseCase = updatePaymentAccountUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'cuentaPago';
    this.resourceName = 'cuenta de pago';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const cuenta = await this.updatePaymentAccountUseCase.execute({
        id,
        body: req.body || {},
        qrFile: req.file ?? null,
        userId,
      });

      return this.responseFormatter.updated(
        res,
        { [this.dataFieldName]: cuenta },
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al actualizar cuenta de pago', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
