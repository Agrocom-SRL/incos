/**
 * Interfaz de Repositorio (solo lectura): ITutoriaAvanceViewRepository
 *
 * Lecturas de las 3 extensiones del módulo TIT · titulación (2026-07-31):
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año, vista `vista_base_tutoria_estudiante_tercer_anio` (178).
 * - Requisito 2 (reporte de avance por carrera): resumen agregado,
 *   vista `vista_tutoria_avance_carrera` (179).
 * - Requisito 3 (planilla de avance "10 en 10"): roster por bimestre,
 *   vista `vista_tutoria_planilla_avance_tercer_anio` (181).
 *
 * Aislado de `IProyectoGradoListadoViewRepository` (SRP: ese repo cubre el
 * listado/ficha de proyectos ya existente; este cubre las 3 lecturas nuevas
 * sobre el roster de 3er año). El detalle por proyecto de los reportes se
 * sigue leyendo con `proyectoGradoListadoViewRepository.findListado`
 * (vista 160), no se duplica aquí.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class ITutoriaAvanceViewRepository {
  /**
   * Estudiantes de 3er año elegibles para elegir modalidad de graduación
   * (vista 178, filtro proyecto_grado_id IS NULL). Paginado.
   *
   * @param {Object} filters - { carreraId, gestionId, search }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findEstudiantesElegibles(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findEstudiantesElegibles() must be implemented');
  }

  /**
   * Resumen agregado de avance de tutorías por carrera (vista 179).
   *
   * @param {Object} filters - { gestionId, carreraId }
   * @returns {Promise<Array<Object>>} Filas crudas snake_case
   */
  async findAvancePorCarrera(_filters = {}) {
    throw new Error('Method findAvancePorCarrera() must be implemented');
  }

  /**
   * Roster de 3er año con proyecto por bimestre (vista 181), para la
   * planilla de seguimiento "10 en 10".
   *
   * @param {Object} filters - { carreraId, gestionId, bimestre }
   * @returns {Promise<Array<Object>>} Filas crudas snake_case
   */
  async findPlanillaAvanceTercerAnio(_filters = {}) {
    throw new Error('Method findPlanillaAvanceTercerAnio() must be implemented');
  }
}
