/**
 * Use Case: ListEstadosCivilesUseCase
 * Módulo: Referencia
 * Lista estados civiles con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { CivilStatusMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class ListEstadosCivilesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ civilStatusRepository, complementariosUsosViewRepository, logger }) {
    super({
      repository: civilStatusRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'estados civiles',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'civilStatuses',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'estadosCiviles',
    });
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades CivilStatus a presentación
   * @returns {CivilStatusMapper}
   */
  getMapper() {
    return CivilStatusMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * (mismo patrón que ListAulasUseCase: incluirInactivos → includeInactive,
   * BaseRepository deja de filtrar por activo=true; soft-deleted siguen fuera).
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.incluirInactivos !== undefined) {
      filters.includeInactive =
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;
    }

    return filters;
  }

  /**
   * Enriquece cada ítem con los conteos de uso del catálogo
   * (cantidadEstudiantes / cantidadDocentes / cantidadPersonal, 0 por defecto)
   * @param {Object[]} data - Ítems en formato de presentación
   * @returns {Promise<Object[]>}
   */
  async enrichData(data) {
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('ESTADO_CIVIL');
    return mergeUsosComplementarios(data, usos);
  }
}
