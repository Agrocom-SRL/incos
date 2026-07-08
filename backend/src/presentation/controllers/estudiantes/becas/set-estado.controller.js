/**
 * PATCH /api/v1/becas-descuentos/:id/estado
 * Activa/desactiva una beca o descuento del catálogo maestro.
 *
 * Permiso: finanzas.beca-descuento (ACTIVAR).
 * Body: { activo: boolean }
 * Contrato: data.becaDescuento = beca/descuento actualizado.
 */
export class SetEstadoBecaDescuentoController {
  constructor({ setEstadoBecaDescuentoUseCase, logger, responseFormatter }) {
    this.setEstadoBecaDescuentoUseCase = setEstadoBecaDescuentoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoBecaDescuentoUseCase.execute(id, activo, userId);
      return this.responseFormatter.updated(res, result, 'beca o descuento', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
