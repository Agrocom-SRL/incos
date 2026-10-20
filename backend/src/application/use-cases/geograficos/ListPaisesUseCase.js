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
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'countries',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
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
