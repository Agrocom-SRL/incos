/**
 * Use Case: ListMunicipiosUseCase
 * Módulo: Geográficos
 * Lista municipios con filtros, paginación y ordenamiento
 *
 * Filtros específicos: provinciaId
 */
import { parseFiltroId } from '../../utils/validacionEntrada.js';
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { MunicipalityMapper } from '../../mappers/geograficos/index.js';

export class ListMunicipiosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ municipalityRepository, logger }) {
    super({
      repository: municipalityRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'municipios',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'municipalities',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'municipios',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Municipality a presentación
   * @returns {MunicipalityMapper}
   */
  getMapper() {
    return MunicipalityMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    const provinciaId = parseFiltroId(queryParams.provinciaId, 'provinciaId');
    if (provinciaId !== undefined) {
      filters.provinceId = provinciaId;
    }

    return filters;
  }
}
