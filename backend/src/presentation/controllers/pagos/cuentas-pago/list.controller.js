/**
 * GET /api/v1/cuentas-pago
 * Controller para listar cuentas de pago con filtros y paginación
 */

import { BaseListController } from '../../base/BaseListController.js';

export class ListCuentasPagoController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListPaymentAccountsUseCase} params.listPaymentAccountsUseCase - Caso de uso para listar cuentas de pago
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listPaymentAccountsUseCase, logger, responseFormatter }) {
    super({
      useCase: listPaymentAccountsUseCase,
      logger,
      responseFormatter,
      resourceName: 'cuentas de pago',
      dataFieldName: 'cuentasPago',
    });
  }
}
