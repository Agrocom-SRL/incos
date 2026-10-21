import { BaseListController } from '../../base/BaseListController.js';

export class ListPlanesEstudiosController extends BaseListController {
  constructor({ listPlanesEstudiosUseCase, logger, responseFormatter }) {
    super({
      useCase: listPlanesEstudiosUseCase,
      logger,
      responseFormatter,
      resourceName: 'planes de estudio',
      dataFieldName: 'planes_estudios',
    });
  }
}
