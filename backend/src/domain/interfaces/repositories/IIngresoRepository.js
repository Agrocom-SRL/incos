/**
 * Interfaz de Repositorio (solo lectura): IIngresoRepository
 *
 * Lecturas del listado unificado de transacciones de ingreso (módulo
 * Finanzas · pantalla "Registro de ingresos") desde la vista SQL
 * `vista_ingresos_listado` (184): 1 fila = 1 pago real, unión (UNION ALL)
 * de:
 * - aportes académicos (pago_cuotas, vista base 182 vista_base_ingreso_aporte)
 * - pagos de capacitación (capacitacion_pagos, vista base 183
 *   vista_base_ingreso_capacitacion)
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IIngresoRepository {
  /**
   * Listado paginado de transacciones de ingreso desde la vista 184.
   *
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=50]
   * @param {string} [params.search] - Filtra por nombre completo, código/CI o número de recibo
   * @param {'APORTE'|'CAPACITACION'} [params.origen] - Filtro opcional de origen
   * @param {string} [params.sortField] - Columna de la vista para ordenar (default: fecha_pago)
   * @param {'ASC'|'DESC'} [params.sortOrder] - Dirección de orden (default: DESC)
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findAll(_params = {}) {
    throw new Error('Method findAll() must be implemented');
  }
}
