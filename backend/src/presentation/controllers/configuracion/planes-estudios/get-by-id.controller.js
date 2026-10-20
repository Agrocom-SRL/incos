import { BaseGetController } from '../../base/BaseGetController.js';

export class GetPlanEstudiosByIdController extends BaseGetController {
  constructor({ getPlanEstudiosByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getPlanEstudiosByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'plan de estudios',
      // Respuesta compuesta (plan_estudio + periodos + …): BaseGetController no envuelve si hay >1 clave
      dataFieldName: 'plan_estudio',
    });
  }
}
