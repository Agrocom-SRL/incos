/**
 * Use Case: ListContributionConfigurationsUseCase
 * Módulo: Pagos
 * Lista configuraciones de aportes con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ContributionConfigurationMapper } from '../../mappers/pagos/index.js';

export class ListContributionConfigurationsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ contributionConfigurationRepository, logger }) {
    super({
      repository: contributionConfigurationRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'configuraciones de aportes',
      collectionFieldName: 'contributionConfigurations',
      dataFieldName: 'configuracionesAportes',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades ContributionConfiguration a presentación
   * @returns {ContributionConfigurationMapper}
   */
  getMapper() {
    return ContributionConfigurationMapper;
  }
}
