/**
 * Interfaz del servicio de generación de la Planilla de Control de Becas por
 * carrera (.xlsx, una sola hoja).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el libro Excel de becas a partir del payload del reporte (el mismo que consume
 * la pantalla, vía GetBecasPorCarreraReporteUseCase).
 *
 * Clean Architecture:
 * - Domain: IBecasReporteExcelGenerator (este contrato).
 * - Infrastructure: BecasReporteExcelBuilder lo implementa con ExcelJS.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 */
export class IBecasReporteExcelGenerator {
  /**
   * Genera el libro Excel de la planilla de becas por carrera.
   *
   * @param {Object} datos - Payload del reporte (ver GetBecasPorCarreraReporteUseCase).
   * @param {{ id:number, nombre:string|null, anio:number|null }} datos.gestion
   * @param {number[]} datos.porcentajes - Tramos de beca presentes (25, 50, ...).
   * @param {Array<Object>} datos.filas - Una fila por carrera.
   * @param {Object} datos.totales - Fila de totales generales.
   * @param {Array<Object>} datos.distribucion - Beneficiados por tramo (donut).
   * @param {Object} datos.resumen - Resumen general.
   * @param {string} [datos.fechaEmision] - Fecha de emisión (YYYY-MM-DD).
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx.
   */
  generarPlanillaBecasPorCarrera(_datos) {
    throw new Error('Method generarPlanillaBecasPorCarrera must be implemented');
  }
}

export default IBecasReporteExcelGenerator;
