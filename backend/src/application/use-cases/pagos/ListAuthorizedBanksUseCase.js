/**
 * Use Case: ListAuthorizedBanksUseCase
 * Módulo: Pagos
 * Lista bancos autorizados con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { AuthorizedBankMapper } from '../../mappers/pagos/index.js';

export class ListAuthorizedBanksUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.authorizedBankRepository - Repositorio de bancos autorizados
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ authorizedBankRepository, logger }) {
    super({
      repository: authorizedBankRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'bancos autorizados',
      collectionFieldName: 'authorizedBanks',
      dataFieldName: 'bancosAutorizados',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades AuthorizedBank a presentación
   * @returns {AuthorizedBankMapper}
   */
  getMapper() {
    return AuthorizedBankMapper;
  }
}
