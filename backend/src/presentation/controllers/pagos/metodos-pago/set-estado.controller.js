/**
 * PATCH /api/v1/metodos-pago/:id/estado
 * Activa/desactiva un método de pago.
 *
 * Permiso: finanzas.configuracion.pago (ACTIVAR).
 * Body: { activo: boolean }
 * Contrato: data.metodoPago = método de pago actualizado.
 */
export class SetEstadoMetodoPagoController {
  constructor({ setEstadoMetodoPagoUseCase, logger, responseFormatter }) {
    this.setEstadoMetodoPagoUseCase = setEstadoMetodoPagoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoMetodoPagoUseCase.execute(id, activo, userId);
      return this.responseFormatter.updated(res, result, 'método de pago', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
