/**
 * GET /api/v1/configuracion-aportes
 * Controller para listar configuraciones de aportes con filtros y paginación
 */

import { BaseListController } from '../../base/BaseListController.js';

export class ListConfiguracionAportesController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListContributionConfigurationsUseCase} params.listContributionConfigurationsUseCase - Caso de uso para listar configuraciones de aportes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listContributionConfigurationsUseCase, logger, responseFormatter }) {
    super({
      useCase: listContributionConfigurationsUseCase,
      logger,
      responseFormatter,
      resourceName: 'configuraciones de aportes',
      dataFieldName: 'configuracionesAportes',
    });
  }
}
