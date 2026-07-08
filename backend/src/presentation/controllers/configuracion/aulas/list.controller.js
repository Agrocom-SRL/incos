import { BaseListController } from '../../base/BaseListController.js';

export class ListAulasController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListAulasUseCase} params.listAulasUseCase - Caso de uso para listar aulas
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listAulasUseCase, logger, responseFormatter }) {
    super({
      useCase: listAulasUseCase,
      logger,
      responseFormatter,
      resourceName: 'aulas',
      dataFieldName: 'aulas',
    });
  }
}
