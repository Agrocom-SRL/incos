/**
 * GET /api/v1/metodos-pago
 * Controller para listar métodos de pago con filtros y paginación
 */

import { BaseListController } from '../../base/BaseListController.js';

export class ListMetodosPagoController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListPaymentMethodsUseCase} params.listPaymentMethodsUseCase - Caso de uso para listar métodos de pago
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listPaymentMethodsUseCase, logger, responseFormatter }) {
    super({
      useCase: listPaymentMethodsUseCase,
      logger,
      responseFormatter,
      resourceName: 'métodos de pago',
      dataFieldName: 'metodosPago',
    });
  }
}
