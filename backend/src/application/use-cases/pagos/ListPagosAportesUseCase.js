/**
 * Use Case: ListPagosAportesUseCase
 * Módulo: Pagos
 * Lista pagos de aportes con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ContributionPaymentMapper } from '../../mappers/pagos/index.js';

export class ListPagosAportesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aportes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ contributionPaymentRepository, logger }) {
    super({
      repository: contributionPaymentRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'pagos de aportes',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'contributionPayments',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'pagos',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades ContributionPayment a presentación
   * @returns {ContributionPaymentMapper}
   */
  getMapper() {
    return ContributionPaymentMapper;
  }
}
