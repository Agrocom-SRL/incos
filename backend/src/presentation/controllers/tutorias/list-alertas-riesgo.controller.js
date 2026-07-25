import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/acompanamiento/alertas (A1)
 * Alertas de riesgo pedagógico (vista 156). dataFieldName: 'alertasRiesgo'.
 */
export class ListAlertasRiesgoController extends BaseListController {
  constructor({ listAlertasRiesgoUseCase, logger, responseFormatter }) {
    super({
      useCase: listAlertasRiesgoUseCase,
      logger,
      responseFormatter,
      resourceName: 'alertas de riesgo',
      dataFieldName: 'alertasRiesgo',
    });
  }
}
