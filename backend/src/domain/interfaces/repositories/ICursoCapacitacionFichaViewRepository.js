/**
 * Interfaz de Repositorio (solo lectura): ICursoCapacitacionFichaViewRepository
 *
 * Lecturas del listado y ficha de cursos de capacitación (módulo CAP) desde
 * las vistas SQL:
 * - `vista_cursos_capacitacion_listado` (155): 1 fila por curso con resumen de aulas de sus grupos,
 *   inscritos_count, cupo_disponible, horarios_count y horarios_detalle.
 * - `vista_base_cursos_capacitacion_horarios` (154): 1 fila por bloque
 *   horario del curso con bloque_etiqueta y dia_orden.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class ICursoCapacitacionFichaViewRepository {
  /**
   * Listado paginado de cursos desde la vista 155.
   *
   * @param {Object} filters
   *   - search: texto sobre titulo/descripcion
   *   - estado: estado del curso (PROPUESTO/ABIERTO/EN_CURSO/CERRADO/CANCELADO)
   *   - includeInactive: incluir cursos inactivos (soporta incluirInactivos)
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findListado(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListado() must be implemented');
  }

  /**
   * Fila de UN curso desde la vista 155 (incluye inactivos), o null.
   *
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findListadoById(_id) {
    throw new Error('Method findListadoById() must be implemented');
  }

  /**
   * Bloques horarios del curso desde la vista 154, ordenados por día y hora.
   *
   * @param {number} capacitacionId
   * @returns {Promise<Array<Object>>} Filas crudas snake_case
   */
  async findHorariosByCapacitacionId(_capacitacionId) {
    throw new Error('Method findHorariosByCapacitacionId() must be implemented');
  }
}
