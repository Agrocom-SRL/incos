import { BaseDeleteController } from '../../base/BaseDeleteController.js';

/**
 * DELETE /api/v1/becas-descuentos/:id
 * Controller para eliminar (soft delete) una beca o descuento
 */
export class DeleteBecaDescuentoController extends BaseDeleteController {
  constructor({ deleteBecaDescuentoUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteBecaDescuentoUseCase,
      logger,
      responseFormatter,
      resourceName: 'beca o descuento',
    });
  }
}
