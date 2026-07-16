import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/participantes
 * Listado de participantes de capacitación. dataFieldName: 'participantes'.
 */
export class ListParticipantesController extends BaseListController {
  constructor({ listParticipantesUseCase, logger, responseFormatter }) {
    super({
      useCase: listParticipantesUseCase,
      logger,
      responseFormatter,
      resourceName: 'participantes',
      dataFieldName: 'participantes',
    });
  }
}
