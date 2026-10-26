/**
 * Use Case: ListGestionesUseCase
 * Módulo: Académico
 * Lista gestiones académicas con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { parseBooleano, parseNumero } from '../../utils/validacionEntrada.js';
import { ManagementMapper } from '../../mappers/academico/ManagementMapper.js';

export class ListGestionesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ managementRepository, logger }) {
    super({
      repository: managementRepository,
      logger,
      moduleName: 'Académico',
      resourceName: 'gestiones',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'managements',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'gestiones',
    });
  }

  /**
   * Construye filtros específicos para gestiones a partir de query params.
   * Soporta:
   * - vigente: query directo (?vigente=0 | ?vigente=1)
   * - filtros: JSON string con active, vigente, year, type
   *
   * @param {Object} queryParams - req.query (page, limit, search, vigente, filtros, ...)
   * @param {Object} baseFilters - Filtros base (search, sort)
   * @returns {Object} Filtros para el repositorio
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    // Query directo: ?vigente=0 | ?vigente=1
    if (queryParams.vigente !== undefined && queryParams.vigente !== '') {
      filters.vigente = parseBooleano(queryParams.vigente, 'vigente');
    }

    // Filtros en JSON: ?filtros={"vigente":false,"active":true}
    if (queryParams.filtros) {
      let parsed = null;
      try {
        parsed = typeof queryParams.filtros === 'string'
          ? JSON.parse(queryParams.filtros)
          : queryParams.filtros;
      } catch (e) {
        this.logger.warn('[ListGestionesUseCase] Error al parsear filtros', { error: e.message });
      }
      // Los valores se validan fuera del try: un valor inválido es 400, no se ignora en silencio.
      if (parsed && typeof parsed === 'object') {
        if (parsed.isActive !== undefined) filters.isActive = parseBooleano(parsed.isActive, 'isActive');
        if (parsed.active !== undefined) filters.isActive = parseBooleano(parsed.active, 'active');
        if (parsed.vigente !== undefined) filters.vigente = parseBooleano(parsed.vigente, 'vigente');
        if (parsed.year !== undefined) {
          filters.year = parseNumero(parsed.year, 'year', { min: 2000, max: 2100, entero: true });
        }
        if (parsed.type !== undefined) filters.type = parsed.type;
      }
    }

    return filters;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Management a presentación
   * @returns {ManagementMapper}
   */
  getMapper() {
    return ManagementMapper;
  }
}
