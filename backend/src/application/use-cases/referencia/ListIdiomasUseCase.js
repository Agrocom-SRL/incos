/**
 * Use Case: ListIdiomasUseCase
 * Módulo: Referencia
 * Lista idiomas con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { LanguageMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class ListIdiomasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ languageRepository, complementariosUsosViewRepository, logger }) {
    super({
      repository: languageRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'idiomas',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'languages',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'idiomas',
    });
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Language a presentación
   * @returns {LanguageMapper}
   */
  getMapper() {
    return LanguageMapper;
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
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('IDIOMA');
    return mergeUsosComplementarios(data, usos);
  }
}
