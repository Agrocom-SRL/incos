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
 * Libro de UNA hoja POR CARRERA (resumen de UN MES, tabla plana con todos
 * los docentes-tutores de la carrera — columna DOCENTE por fila, sin
 * sub-cabeceras): un docente-tutor puede tutorar en más de una carrera a la
 * vez, así que aparece repetido en cada hoja de esas carreras, solo con los
 * tutoriados de esa carrera (partición limpia a nivel de tutoriado, no de
 * docente).
 */
export class ISeguimientoTutoriaDocentesExcelGenerator {
  /**
   * @param {Object} datos
   * @param {number} datos.anio
   * @param {number} datos.mes
   * @param {Array<Object>} datos.carreras - [{ carreraId, carreraNombre,
   *   tutoriados: [{ docenteId, docenteNombre, estudianteId, nombreCompleto,
   *   totalTutoriasMes, tutoriasEjecutadasMes, porcentajeAvance,
   *   ultimaActividad, ultimaObservacion }] }] — un renglón por tutoriado.
   * @returns {Promise<Buffer>}
   */
  async generarSeguimientoTutoriaDocentes(_datos) {
    throw new Error('Method generarSeguimientoTutoriaDocentes() must be implemented');
  }
}
