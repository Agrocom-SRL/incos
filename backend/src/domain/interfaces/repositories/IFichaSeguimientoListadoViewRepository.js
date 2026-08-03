/**
 * Interfaz de Repositorio (solo lectura): IFichaSeguimientoListadoViewRepository
 *
 * Lecturas del listado de fichas de seguimiento en clase (módulo DOC ·
 * supervisión docente) desde la vista SQL:
 * - `vista_supervision_fichas_listado` (174): 1 fila por ficha vigente con el
 *   contexto de la asignación observada (docente, asignatura, carrera,
 *   paralelo/curso, gestión — reutiliza la vista 51), el evaluador resuelto
 *   desde `usuarios` y el resultado derivado (docs_completos «n/4» +
 *   asistentes/en planilla). SIN los TEXT de observaciones.
 *
 * El wrapper self NO es una vista aparte: «mis fichas» del docente es
 * WHERE docente_id = ? sobre la vista 174.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IFichaSeguimientoListadoViewRepository {
  /**
   * Listado paginado de fichas desde la vista 174.
   *
   * @param {Object} filters
   *   - search: texto sobre docente_nombre/asignatura_nombre/evaluador_nombre/carrera_nombre
   *   - docenteId, gestionId, fechaDesde (YYYY-MM-DD), fechaHasta (YYYY-MM-DD)
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findListado(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListado() must be implemented');
  }

  /**
   * Fila de UNA ficha desde la vista 174 (contexto de cabecera), o null.
   *
   * @param {number} fichaId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(_fichaId) {
    throw new Error('Method findListadoById() must be implemented');
  }
}
