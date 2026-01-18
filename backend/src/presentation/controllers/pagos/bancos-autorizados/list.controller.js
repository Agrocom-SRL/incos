/**
 * GET /api/v1/bancos-autorizados
 * Controller para listar bancos autorizados con filtros y paginación
 */

import { BaseListController } from '../../base/BaseListController.js';

export class ListBancosAutorizadosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListAuthorizedBanksUseCase} params.listAuthorizedBanksUseCase - Caso de uso para listar bancos autorizados
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listAuthorizedBanksUseCase, logger, responseFormatter }) {
    super({
      useCase: listAuthorizedBanksUseCase,
      logger,
      responseFormatter,
      resourceName: 'bancos autorizados',
      dataFieldName: 'bancosAutorizados',
    });
  }
}
