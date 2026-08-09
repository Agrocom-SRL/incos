import { IngresoMapper } from '../../mappers/ingresos/IngresoMapper.js';

/**
 * Use Case: ListIngresosUseCase
 * Módulo: Finanzas — registro de ingresos
 *
 * Lista transacciones individuales de ingreso (1 fila = 1 pago real) desde la
 * vista 184 (vista_ingresos_listado), que une aportes académicos
 * (pago_cuotas) y pagos de capacitación (capacitacion_pagos).
 *
 * Ubicación (decisión no especificada por el ticket original): se creó la
 * carpeta `use-cases/ingresos/` en vez de reusar `use-cases/pagos/` porque
 * este caso de uso cruza dos dominios (aportes académicos y capacitación)
 * que hoy viven en carpetas/tokens separados (`pagos/` y `capacitacion/`);
 * agruparlo bajo cualquiera de los dos habría sido engañoso sobre su alcance.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { ingresos, total, page, limit, totalPages }.
 */
export class ListIngresosUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.ingresoRepository - Vista 184 (solo lectura)
   * @param {ILogger} params.logger
   */
  constructor({ ingresoRepository, logger }) {
    this.ingresoRepository = ingresoRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - origen ('APORTE'|'CAPACITACION'), sort ("campo:DIRECCION")
   * @returns {Promise<{ingresos: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    let sortField;
    let sortOrder;
    if (queryParams.sort && typeof queryParams.sort === 'string') {
      const [field, dir] = queryParams.sort.split(':');
      sortField = field || undefined;
      sortOrder = (dir || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    const origen =
      queryParams.origen === 'APORTE' || queryParams.origen === 'CAPACITACION'
        ? queryParams.origen
        : undefined;

    const { rows, total } = await this.ingresoRepository.findAll({
      page: pageNum,
      limit: limitNum,
      search: baseFilters.search,
      origen,
      sortField,
      sortOrder,
    });

    this.logger.info('[Finanzas] Ingresos listados', { total, count: rows.length });

    return {
      ingresos: IngresoMapper.rowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
