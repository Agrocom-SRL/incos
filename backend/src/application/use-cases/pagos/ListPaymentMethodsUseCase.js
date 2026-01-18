/**
 * Use Case: ListPaymentMethodsUseCase
 * Módulo: Pagos
 * Lista métodos de pago con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { PaymentMethodMapper } from '../../mappers/pagos/index.js';

export class ListPaymentMethodsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ paymentMethodRepository, logger }) {
    super({
      repository: paymentMethodRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'métodos de pago',
      collectionFieldName: 'paymentMethods',
      dataFieldName: 'metodosPago',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades PaymentMethod a presentación
   * @returns {PaymentMethodMapper}
   */
  getMapper() {
    return PaymentMethodMapper;
  }
}
