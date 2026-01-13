/**
 * Use Case: ListParalelosUseCase
 * Módulo: Académico
 * Lista paralelos con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: periodo_id, carrera_id
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ParallelMapper } from '../../mappers/academico/index.js';

export class ListParalelosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ parallelRepository, logger }) {
    super({
      repository: parallelRepository,
      logger,
      moduleName: 'Académico',
      resourceName: 'paralelos',
      collectionFieldName: 'parallels',
      dataFieldName: 'paralelos',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Parallel a presentación
   * @returns {ParallelMapper}
   */
  getMapper() {
    return ParallelMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.periodo_id) {
      filters.periodId = parseInt(queryParams.periodo_id);
    }

    if (queryParams.carrera_id) {
      filters.careerId = parseInt(queryParams.carrera_id);
    }

    return filters;
  }
}
