/**
 * Interfaz del generador Excel del reporte de Seguimiento de tutorías a
 * docentes (módulo TIT · titulación, extensión 2026-08-10). Reemplaza
 * `IPlanillaAvanceTutoriaExcelGenerator` (planilla de avance "10 en 10" de
 * 3er año: dependía de Matrícula/`periodo_numero = 3`, sin datos en
 * desarrollo y sin correspondencia con ningún documento físico real).
 *
 * Réplica digital de "PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx"
 * ("PLANILLA DE SEGUIMIENTO A DOCENTES EN TUTORIAS"): reporte
 * ADMINISTRATIVO de Dirección Académica sobre el cumplimiento de cada
 * docente-tutor (no un reporte al estudiante), con espacio para su firma.
 *
 * Libro de UNA hoja POR DOCENTE (mismo criterio 1-hoja-por-docente del
 * documento físico real), mismo criterio que
 * `IPlanillaAvanceTutoriaExcelGenerator` (1 hoja por carrera/bimestre).
 */
export class ISeguimientoTutoriaDocentesExcelGenerator {
  /**
   * @param {Object} datos
   * @param {number} datos.anio
   * @param {number} datos.mes
   * @param {Array<Object>} datos.docentes - [{ docenteId, docenteNombre,
   *   carreras: [{carreraId, carreraNombre}], tutoriasEjecutadasMes,
   *   tutoriados: [{ estudianteId, nombreCompleto, ci, proyectoGradoId,
   *   proyectoTitulo, carreraNombre, tutoriasEjecutadasMes,
   *   porcentajeAvance, ultimaActividad, ultimaObservacion }] }]
   * @returns {Promise<Buffer>}
   */
  async generarSeguimientoTutoriaDocentes(_datos) {
    throw new Error('Method generarSeguimientoTutoriaDocentes() must be implemented');
  }
}
