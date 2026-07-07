import { BaseCreateController } from '../../base/BaseCreateController.js';

/**
 * POST /api/v1/becas-descuentos
 * Controller para crear una beca o descuento del catálogo maestro
 */
export class CreateBecaDescuentoController extends BaseCreateController {
  constructor({ createBecaDescuentoUseCase, logger, responseFormatter }) {
    super({
      useCase: createBecaDescuentoUseCase,
      logger,
      responseFormatter,
      resourceName: 'beca o descuento',
      dataFieldName: 'becaDescuento',
    });
  }

  prepareData(body) {
    return body;
  }
}
