/**
 * Use Case: ListPaymentMethodsUseCase
 * Módulo: Pagos
 * Lista métodos de pago con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { PaymentMethodMapper, mergeUsosFinanzas } from '../../mappers/pagos/index.js';

export class ListPaymentMethodsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
   * @param {IFinanzasUsosViewRepository} params.finanzasUsosViewRepository - Conteos de uso (vista 152)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ paymentMethodRepository, finanzasUsosViewRepository, logger }) {
    super({
      repository: paymentMethodRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'métodos de pago',
      collectionFieldName: 'paymentMethods',
      dataFieldName: 'metodosPago',
    });
    this.finanzasUsosViewRepository = finanzasUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades PaymentMethod a presentación
   * @returns {PaymentMethodMapper}
   */
  getMapper() {
    return PaymentMethodMapper;
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
    const usos = await this.finanzasUsosViewRepository.getUsosByCatalogo('METODO_PAGO');
    return mergeUsosFinanzas(data, usos);
  }
}
