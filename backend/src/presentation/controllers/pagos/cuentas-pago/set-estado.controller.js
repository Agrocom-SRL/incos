/**
 * PATCH /api/v1/cuentas-pago/:id/estado
 * Activa/desactiva una cuenta de pago.
 *
 * Permiso: finanzas.configuracion.pago (ACTIVAR).
 * Body: { activo: boolean }
 * Contrato: data.cuentaPago = cuenta de pago actualizada.
 */
export class SetEstadoCuentaPagoController {
  constructor({ setEstadoCuentaPagoUseCase, logger, responseFormatter }) {
    this.setEstadoCuentaPagoUseCase = setEstadoCuentaPagoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoCuentaPagoUseCase.execute(id, activo, userId);
      return this.responseFormatter.updated(res, result, 'cuenta de pago', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
