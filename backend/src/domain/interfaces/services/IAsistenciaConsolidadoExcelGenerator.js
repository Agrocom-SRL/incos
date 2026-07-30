/**
 * Interfaz del generador Excel del Consolidado % de asistencia (ACA-ASI).
 * Libro de UNA hoja (un paralelo, un bimestre o el acumulado anual).
 * Implementación: infrastructure/external/excel/asistencia-consolidado/.
 */
export class IAsistenciaConsolidadoExcelGenerator {
  /**
   * @param {Object} _datos
   * @param {Object} _datos.cabecera - { carrera, periodo, paralelo, turno, gestionAnio, bimestreLabel }
   * @param {Array<Object>} _datos.asignaturas - [{ ofertaCursoId, sigla, nombre, docenteNombre }]
   * @param {Array<Object>} _datos.estudiantes - [{ nombreCompleto, codigo, celdas: { [ofertaCursoId]: { pctAsistencia, ... } }, promedioPct }]
   * @returns {Promise<Buffer>}
   */
  async generarConsolidadoAsistencia(_datos) {
    throw new Error('Method generarConsolidadoAsistencia() must be implemented');
  }
}
