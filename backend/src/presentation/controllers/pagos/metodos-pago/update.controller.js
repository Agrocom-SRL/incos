/**
 * PUT /api/v1/metodos-pago/:id
 * Edita un método de pago (nombre y/o estado activo).
 *
 * Permiso: configuracion.pagos (EDITAR).
 * Body: nombre?, activo?
 * Contrato: data.metodoPago = método de pago actualizado.
 */
export class UpdateMetodoPagoController {
  constructor({ updatePaymentMethodUseCase, logger, responseFormatter }) {
    this.updatePaymentMethodUseCase = updatePaymentMethodUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'metodoPago';
    this.resourceName = 'método de pago';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id ?? null;
      const metodoPago = await this.updatePaymentMethodUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(
        res,
        { [this.dataFieldName]: metodoPago },
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al actualizar método de pago', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
