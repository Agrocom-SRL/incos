/**
 * Interfaz del generador Excel del reporte de Deserción estudiantil (ACA,
 * pestaña Deserción). Libro de UNA hoja: resumen por carrera × gestión +
 * detalle de desertores (grano ANUAL).
 * Implementación: infrastructure/external/excel/desercion/.
 */
export class IDesercionExcelGenerator {
  /**
   * @param {Object} _datos
   * @param {string} _datos.fechaEmision
   * @param {string|null} _datos.gestionFiltro - Etiqueta de la gestión filtrada (o null = todas).
   * @param {Array<Object>} _datos.carreras - Agregado carrera × gestión (camelCase).
   * @param {Array<Object>} _datos.desertores - Detalle de desertores (camelCase).
   * @param {Object} _datos.resumen - Totales globales del universo filtrado.
   * @returns {Promise<Buffer>}
   */
  async generarReporteDesercion(_datos) {
    throw new Error('Method generarReporteDesercion() must be implemented');
  }
}
