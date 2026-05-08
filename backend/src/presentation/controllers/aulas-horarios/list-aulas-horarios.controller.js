import { BaseListController } from '../base/BaseListController.js';

export class ListAulasHorariosController extends BaseListController {
  constructor({ listAulasHorariosUseCase, logger, responseFormatter }) {
    super({
      useCase: listAulasHorariosUseCase,
      logger,
      responseFormatter,
      resourceName: 'bloques de horarios en aulas',
      dataFieldName: 'bloques',
    });
  }
}

