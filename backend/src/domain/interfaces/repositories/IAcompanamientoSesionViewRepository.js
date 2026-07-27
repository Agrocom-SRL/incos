/**
 * Interfaz de Repositorio (solo lectura): IAcompanamientoSesionViewRepository
 *
 * Lecturas de sesiones de refuerzo (módulo TUT · acompañamiento) desde:
 * - `vista_base_acompanamiento_sesion_fila` (161): 1 fila por sesión con
 *   curso/docente/materia/paralelo + agregados de estudiantes.
 * - `vista_acompanamiento_sesiones_resumen` (162): agregado mensual por carrera.
 * - estudiantes de UNA sesión enriquecidos con la vista 156 (datos del
 *   estudiante y sus notas en la materia reforzada).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IAcompanamientoSesionViewRepository {
  /**
   * Listado paginado de sesiones desde la vista 161.
   *
   * @param {Object} filters
   *   - search: texto sobre tema/materia/docente
   *   - gestionId, docenteId, asignacionDocenteId, estado, modalidad
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findSesiones(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findSesiones() must be implemented');
  }

  /**
   * Fila de UNA sesión desde la vista 161, o null.
   *
   * @param {number} sesionId
   * @returns {Promise<Object|null>}
   */
  async findSesionById(_sesionId) {
    throw new Error('Method findSesionById() must be implemented');
  }

  /**
   * Estudiantes vigentes de la sesión con sus datos
   * (sesion_refuerzo_estudiantes ⋈ vista 156 por matricula_materia_id).
   *
   * @param {number} sesionId
   * @returns {Promise<Array<Object>>}
   */
  async findEstudiantesBySesionId(_sesionId) {
    throw new Error('Method findEstudiantesBySesionId() must be implemented');
  }

  /**
   * Resumen mensual por carrera (vista 162).
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findResumenMensual(_gestionId = null) {
    throw new Error('Method findResumenMensual() must be implemented');
  }
}
