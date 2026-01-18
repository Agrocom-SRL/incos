/**
 * Use Case: ListPaymentAccountsUseCase
 * Módulo: Pagos
 * Lista cuentas de pago con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { PaymentAccountMapper } from '../../mappers/pagos/index.js';

export class ListPaymentAccountsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.paymentAccountRepository - Repositorio de cuentas de pago
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ paymentAccountRepository, logger }) {
    super({
      repository: paymentAccountRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'cuentas de pago',
      collectionFieldName: 'paymentAccounts',
      dataFieldName: 'cuentasPago',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades PaymentAccount a presentación
   * @returns {PaymentAccountMapper}
   */
  getMapper() {
    return PaymentAccountMapper;
  }
}
