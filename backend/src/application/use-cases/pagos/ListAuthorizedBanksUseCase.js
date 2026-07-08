/**
 * Use Case: ListAuthorizedBanksUseCase
 * Módulo: Pagos
 * Lista bancos autorizados con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { AuthorizedBankMapper, mergeUsosFinanzas } from '../../mappers/pagos/index.js';

export class ListAuthorizedBanksUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.authorizedBankRepository - Repositorio de bancos autorizados
   * @param {IFinanzasUsosViewRepository} params.finanzasUsosViewRepository - Conteos de uso (vista 152)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ authorizedBankRepository, finanzasUsosViewRepository, logger }) {
    super({
      repository: authorizedBankRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'bancos autorizados',
      collectionFieldName: 'authorizedBanks',
      dataFieldName: 'bancosAutorizados',
    });
    this.finanzasUsosViewRepository = finanzasUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades AuthorizedBank a presentación
   * @returns {AuthorizedBankMapper}
   */
  getMapper() {
    return AuthorizedBankMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * (mismo patrón que ListIdiomasUseCase: incluirInactivos → includeInactive,
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
   * (cantidadPagos / cantidadCuentas / cantidadAsignaciones / totalReferencias, 0 por defecto)
   * @param {Object[]} data - Ítems en formato de presentación
   * @returns {Promise<Object[]>}
   */
  async enrichData(data) {
    const usos = await this.finanzasUsosViewRepository.getUsosByCatalogo('BANCO');
    return mergeUsosFinanzas(data, usos);
  }
}
