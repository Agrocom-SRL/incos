/**
 * Interfaz del servicio de generación de la Planilla de Control de Cuentas por
 * Cobrar a estudiantes (.xlsx, una sola hoja).
 *
 * Contrato que debe cumplir cualquier implementación de infraestructura que arme
 * el libro Excel de cuentas por cobrar a partir del payload del reporte (el mismo
 * que consume la pantalla, vía GetCuentasPorCobrarReporteUseCase).
 *
 * Clean Architecture:
 * - Domain: ICuentasPorCobrarReporteExcelGenerator (este contrato).
 * - Infrastructure: CuentasPorCobrarExcelBuilder lo implementa con ExcelJS.
 * - Application: el use case depende de esta interfaz (inyectada por el container),
 *   nunca de la implementación concreta.
 */
export class ICuentasPorCobrarReporteExcelGenerator {
  /**
   * Genera el libro Excel de la planilla de cuentas por cobrar.
   *
   * @param {Object} datos - Payload del reporte (ver GetCuentasPorCobrarReporteUseCase).
   * @param {{ id:number, nombre:string|null, anio:number|null }} datos.gestion
   * @param {number} datos.montoMaximoPorEstudiante
   * @param {Array<Object>} datos.carreras - Carrera → paralelos → estudiantes (deudores).
   * @param {Object} datos.resumen - Resumen general (pendiente total, etc.).
   * @param {string} [datos.fechaEmision] - Fecha de emisión (YYYY-MM-DD).
   * @returns {Promise<Buffer>} Buffer del archivo .xlsx.
   */
  generarPlanillaCuentasPorCobrar(_datos) {
    throw new Error('Method generarPlanillaCuentasPorCobrar must be implemented');
  }
}

export default ICuentasPorCobrarReporteExcelGenerator;
