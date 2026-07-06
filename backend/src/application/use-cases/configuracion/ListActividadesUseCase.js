/**
 * Use Case: ListActividadesUseCase
 * Módulo: Configuración
 * Lista actividades (catálogo maestro reutilizable entre gestiones) con
 * filtros, paginación y ordenamiento.
 *
 * Filtros específicos: tipo, esDestacada
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ActivityMapper } from '../../mappers/configuracion/index.js';

export class ListActividadesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.activityRepository - Repositorio de actividades
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ activityRepository, logger }) {
    super({
      repository: activityRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'actividades',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'activities',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON (debe igualar dataKey del frontend)
      dataFieldName: 'actividades',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Activity a presentación
   * @returns {ActivityMapper}
   */
  getMapper() {
    return ActivityMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.tipo) {
      filters.type = queryParams.tipo;
    }
    if (queryParams.esDestacada !== undefined) {
      filters.isHighlighted = queryParams.esDestacada === 'true' || queryParams.esDestacada === true;
    }

    return filters;
  }
}
