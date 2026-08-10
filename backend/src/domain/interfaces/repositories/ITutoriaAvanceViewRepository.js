/**
 * Interfaz de Repositorio (solo lectura): ITutoriaAvanceViewRepository
 *
 * Lecturas de las extensiones del módulo TIT · titulación:
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año, vista `vista_base_tutoria_estudiante_tercer_anio` (178).
 * - Requisito 2 (reporte de avance por carrera): resumen agregado,
 *   vista `vista_tutoria_avance_carrera` (179).
 * - Seguimiento de tutorías a docentes (2026-08-10, reemplaza la planilla de
 *   avance "10 en 10" de 3er año): roster de tutoriados ACTIVOS por
 *   docente-tutor, vista `vista_tutoria_seguimiento_docentes` (181) + agregado
 *   mensual de `vista_base_tutoria_bitacora_mes_fila` (180).
 *
 * Aislado de `IProyectoGradoListadoViewRepository` (SRP: ese repo cubre el
 * listado/ficha de proyectos ya existente; este cubre las lecturas nuevas
 * sobre el roster de 3er año / seguimiento a docentes). El detalle por
 * proyecto de los reportes se sigue leyendo con
 * `proyectoGradoListadoViewRepository.findListado` (vista 160), no se
 * duplica aquí.
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
   * Roster de tutoriados ACTIVOS por docente-tutor (vista 181), con el
   * agregado mensual de bitácora (vista 180) filtrado por año/mes vía
   * LEFT JOIN en el propio repositorio — ningún tutoriado se pierde cuando
   * su proyecto no tuvo bitácora en el mes consultado (queda con 0/NULL).
   *
   * @param {Object} filters - { docenteId, carreraId, anio, mes }
   * @returns {Promise<Array<Object>>} Filas crudas snake_case
   */
  async findSeguimientoTutoriaDocentes(_filters = {}) {
    throw new Error('Method findSeguimientoTutoriaDocentes() must be implemented');
  }
}
