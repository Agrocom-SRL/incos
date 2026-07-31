/**
 * Interfaz del generador Excel de la Planilla de avance de tutorías
 * "10 en 10" (módulo TIT · titulación, Requisito 3 — extensión 2026-07-31).
 *
 * Artefacto de impresión/monitoreo bimestral de 3er año (NO es un documento
 * legal con folio persistido, ver §0.5 del plan de desarrollo): folios de 10
 * estudiantes apilados + hoja de firmas de docentes al final (sin incrementar
 * folio) + cuadro de % (aprobados/reprobados/abandonos).
 *
 * Libro de UNA hoja (una carrera + un bimestre por exportación), mismo
 * criterio que `IAsistenciaConsolidadoExcelGenerator`.
 */
export class IPlanillaAvanceTutoriaExcelGenerator {
  /**
   * @param {Object} datos
   * @param {Object} datos.cabecera - { carreraNombre, gestionAnio, bimestre }
   * @param {Array<Array<Object>>} datos.folios - Folios de hasta 10
   *   estudiantes: [{ numeroOrden, nombreCompleto, ci, expedicion,
   *   tutorNombre, totalTutoriasBimestre, porcentajeAvance,
   *   ultimaObservacion, resultadoTutoria }]
   * @param {Array<string>} datos.resumenTutores - Nombres de tutores
   *   distintos del roster (para la hoja de firmas).
   * @param {Object} datos.tally - { aprobados, reprobados, abandonos, enProceso, total }
   * @returns {Promise<Buffer>}
   */
  async generarPlanillaAvanceTutoria(_datos) {
    throw new Error('Method generarPlanillaAvanceTutoria() must be implemented');
  }
}
