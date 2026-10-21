/**
 * Interfaz de Repositorio (solo lectura): IGrupoCapacitacionListadoViewRepository
 *
 * Listado de grupos de TODAS las capacitaciones (módulo CAP) desde las vistas:
 * - `vista_grupos_capacitacion_listado` (190): 1 fila por grupo con su curso,
 *   aula, cupo efectivo, inscritos vigentes y horarios formateados.
 * - `vista_base_cursos_capacitacion_horarios` (154): bloques del grupo.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IGrupoCapacitacionListadoViewRepository {
  /**
   * Listado paginado de grupos.
   *
   * @param {Object} filters
   *   - search: texto sobre nombre del grupo o título del curso
   *   - cursoId: filtrar por curso
   *   - includeInactiveCursos: incluir grupos de cursos inactivos
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findListado(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListado() must be implemented');
  }

  /**
   * Horarios (bloques) de varios grupos, ordenados por día y hora.
   *
   * @param {number[]} grupoIds
   * @returns {Promise<Array<Object>>} Filas crudas snake_case (grupo_id, horario_id, bloque_etiqueta)
   */
  async findHorariosByGrupoIds(_grupoIds) {
    throw new Error('Method findHorariosByGrupoIds() must be implemented');
  }
}
