/**
 * Use Case: ListPaisesUseCase
 * Módulo: Geográficos
 * Lista países con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { CountryMapper } from '../../mappers/geograficos/index.js';

export class ListPaisesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.countryRepository - Repositorio de países
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ countryRepository, logger }) {
    super({
      repository: countryRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'países',
      collectionFieldName: 'countries',
      dataFieldName: 'paises',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Country a presentación
   * @returns {CountryMapper}
   */
  getMapper() {
    return CountryMapper;
  }
}

