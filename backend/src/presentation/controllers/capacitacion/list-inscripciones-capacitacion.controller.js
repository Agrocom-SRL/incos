import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/inscripciones-capacitacion
 * Listado de inscripciones (participante + curso + estado de pago).
 * dataFieldName: 'inscripcionesCapacitacion'.
 */
export class ListInscripcionesCapacitacionController extends BaseListController {
  constructor({ listInscripcionesCapacitacionUseCase, logger, responseFormatter }) {
    super({
      useCase: listInscripcionesCapacitacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripciones de capacitación',
      dataFieldName: 'inscripcionesCapacitacion',
    });
  }
}
