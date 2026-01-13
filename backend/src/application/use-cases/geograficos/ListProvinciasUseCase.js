/**
 * Use Case: ListProvinciasUseCase
 * Módulo: Geográficos
 * Lista provincias con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: departamentoId
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ProvinceMapper } from '../../mappers/geograficos/index.js';

export class ListProvinciasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ provinceRepository, logger }) {
    super({
      repository: provinceRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'provincias',
      collectionFieldName: 'provinces',
      dataFieldName: 'provincias',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Province a presentación
   * @returns {ProvinceMapper}
   */
  getMapper() {
    return ProvinceMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.departamentoId) {
      filters.departmentId = Number(queryParams.departamentoId);
    }

    return filters;
  }
}

