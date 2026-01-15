/**
 * Use Case: ListDocumentacionUseCase
 * Módulo: Referencia
 * Lista tipos de documentación con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: tipoDocumento
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { DocumentacionMapper } from '../../mappers/referencia/index.js';

export class ListDocumentacionUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.documentacionRepository - Repositorio de tipos de documentación
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ documentacionRepository, logger }) {
    super({
      repository: documentacionRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'tipos de documentación',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'documentations',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'documentacion',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Documentation a presentación
   * @returns {DocumentacionMapper}
   */
  getMapper() {
    return DocumentacionMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.tipoDocumento) {
      filters.tipoDocumento = queryParams.tipoDocumento;
    }

    return filters;
  }
}

