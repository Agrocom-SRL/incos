/**
 * Use Case: ListBecasDescuentosUseCase
 * Módulo: Estudiantes
 * Lista becas y descuentos con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';
import { mergeUsosFinanzas } from '../../mappers/pagos/index.js';

export class ListBecasDescuentosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scholarshipRepository - Repositorio de becas y descuentos
   * @param {IFinanzasUsosViewRepository} params.finanzasUsosViewRepository - Conteos de uso (vista 152)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ scholarshipRepository, finanzasUsosViewRepository, logger }) {
    super({
      repository: scholarshipRepository,
      logger,
      moduleName: 'Estudiantes',
      resourceName: 'becas y descuentos',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'scholarships',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'becasDescuentos',
    });
    this.finanzasUsosViewRepository = finanzasUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Scholarship a presentación
   * @returns {BecaDescuentoMapper}
   */
  getMapper() {
    return BecaDescuentoMapper;
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
    const usos = await this.finanzasUsosViewRepository.getUsosByCatalogo('BECA_DESCUENTO');
    return mergeUsosFinanzas(data, usos);
  }
}
