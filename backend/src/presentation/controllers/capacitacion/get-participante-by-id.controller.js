import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/participantes/:id
 * Ficha de participante (datos + inscripciones). dataFieldName: 'participante'.
 */
export class GetParticipanteByIdController extends BaseGetController {
  constructor({ getParticipanteByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getParticipanteByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'participante',
      dataFieldName: 'participante',
    });
  }
}
