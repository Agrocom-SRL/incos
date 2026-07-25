/**
 * Interfaz de Repositorio (solo lectura): IRiesgoAcademicoViewRepository
 *
 * Lecturas de riesgo pedagógico (módulo TUT · acompañamiento) desde las
 * vistas SQL calculadas (el riesgo NO es tabla):
 * - `vista_base_acompanamiento_riesgo_fila` (156): estudiante × materia con
 *   umbral parametrizable (configuracion_evaluacion ACOMPANAMIENTO_PEDAGOGICO)
 *   y flag en_riesgo.
 * - `vista_acompanamiento_riesgo_carrera` (157): agregado por gestión/carrera.
 * - `vista_acompanamiento_reprobacion_materia` (158): agregado por materia.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IRiesgoAcademicoViewRepository {
  /**
   * Listado paginado de alertas desde la vista 156.
   *
   * @param {Object} filters
   *   - search: texto sobre nombre_completo/codigo_estudiante/asignatura
   *   - gestionId, carreraId, paraleloGestionId, docenteId (via asignación)
   *   - soloEnRiesgo: si true, WHERE en_riesgo = 1 (default true en listados)
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findAlertas(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findAlertas() must be implemented');
  }

  /**
   * Filas de la vista 156 de UN estudiante (todas sus materias, en riesgo o no).
   *
   * @param {number} estudianteId
   * @param {Object} [filters] - { gestionId }
   * @returns {Promise<Array<Object>>}
   */
  async findByEstudianteId(_estudianteId, _filters = {}) {
    throw new Error('Method findByEstudianteId() must be implemented');
  }

  /**
   * Agregado por carrera (vista 157).
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findResumenCarrera(_gestionId = null) {
    throw new Error('Method findResumenCarrera() must be implemented');
  }

  /**
   * Agregado por materia (vista 158), ordenado por pct_riesgo DESC.
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findReprobacionMateria(_gestionId = null) {
    throw new Error('Method findReprobacionMateria() must be implemented');
  }
}
