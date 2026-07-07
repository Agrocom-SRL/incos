/**
 * Use Case: ListAulasUseCase
 * Módulo: Configuración
 * Lista aulas (catálogo maestro de espacios físicos: aulas/laboratorios/talleres/auditorios)
 * con filtros, paginación y ordenamiento.
 *
 * Filtros específicos: categoria, incluirInactivos
 * (`LAB-2 / Sala de Docentes`, id 2, está desactivado a propósito: no se oculta
 * ni se reactiva aquí, solo se respeta el flag incluirInactivos como en el resto
 * de catálogos de referencia).
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ClassroomMapper } from '../../mappers/configuracion/index.js';

export class ListAulasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.classroomRepository - Repositorio de aulas
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ classroomRepository, logger }) {
    super({
      repository: classroomRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'aulas',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'classrooms',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      dataFieldName: 'aulas',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Classroom a presentación
   * @returns {ClassroomMapper}
   */
  getMapper() {
    return ClassroomMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.categoria) {
      filters.category = queryParams.categoria;
    }

    if (queryParams.incluirInactivos !== undefined) {
      filters.includeInactive =
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;
    }

    return filters;
  }
}
