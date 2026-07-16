import { BaseGetController } from '../base/BaseGetController.js';

/**
 * GET /api/v1/inscripciones-capacitacion/:id
 * Ficha de inscripción (participante + curso + historial de pagos).
 * dataFieldName: 'inscripcionCapacitacion'.
 */
export class GetInscripcionCapacitacionByIdController extends BaseGetController {
  constructor({ getInscripcionCapacitacionByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getInscripcionCapacitacionByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripción de capacitación',
      dataFieldName: 'inscripcionCapacitacion',
    });
  }
}
