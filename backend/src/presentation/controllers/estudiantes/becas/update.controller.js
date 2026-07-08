/**
 * PUT /api/v1/becas-descuentos/:id
 * Controller para actualizar una beca o descuento (actualización parcial)
 *
 * Mirror manual de UpdateDiscapacidadController (no usa un BaseUpdateController
 * genérico en este módulo).
 */
export class UpdateBecaDescuentoController {
  constructor({ updateBecaDescuentoUseCase, logger, responseFormatter }) {
    this.updateBecaDescuentoUseCase = updateBecaDescuentoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateBecaDescuentoUseCase.execute(id, body, userId);
      const { becaDescuento } = result;
      return this.responseFormatter.updated(res, becaDescuento, 'beca o descuento', becaDescuento.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
