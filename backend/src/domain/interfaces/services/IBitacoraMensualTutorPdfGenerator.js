/**
 * Interfaz del generador PDF del reporte mensual de bitácora por tutor
 * (módulo TUT · titulación; planilla DDE "tutorías programadas/desarrolladas
 * en el mes"). Fuente: vista 163.
 */
export class IBitacoraMensualTutorPdfGenerator {
  /**
   * Genera el PDF del reporte mensual y retorna el contenido como Buffer.
   *
   * @param {Object} options
   * @param {string} options.mes - Mes del reporte ('YYYY-MM')
   * @param {number|string|null} [options.gestionAnio] - Año de gestión
   * @param {Array<Object>} options.filas - Filas de la vista 163 en camelCase:
   *   [{ tutorNombre, carreraNombre, tutoriasRegistradas, tutoriasConfirmadas,
   *      proyectosAtendidos }]
   * @returns {Promise<Buffer>}
   */
  async generate(_options = {}) {
    throw new Error('Method generate must be implemented');
  }
}
