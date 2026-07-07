import { BaseGetController } from '../../base/BaseGetController.js';

/**
 * GET /api/v1/becas-descuentos/:id
 * Controller para obtener una beca o descuento por ID
 */
export class GetBecaDescuentoByIdController extends BaseGetController {
  constructor({ getBecaDescuentoByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getBecaDescuentoByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'beca o descuento',
      dataFieldName: 'becaDescuento',
    });
  }
}
