import { BaseGetController } from '../../base/BaseGetController.js';

export class GetParaleloCursosOfertaController extends BaseGetController {
  constructor({ getParaleloCursosOfertaUseCase, logger, responseFormatter }) {
    super({
      useCase: getParaleloCursosOfertaUseCase,
      logger,
      responseFormatter,
      resourceName: 'oferta de cursos del paralelo',
      dataFieldName: 'cursosOferta',
    });
  }
}
