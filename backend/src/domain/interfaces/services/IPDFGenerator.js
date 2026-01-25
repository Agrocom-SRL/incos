/**
 * Interfaz del servicio de generación de PDFs
 * Define el contrato que debe cumplir cualquier implementación de generación de PDFs
 * para el Instituto INCOS.
 *
 * Esta interfaz agrupa todos los métodos de generación de PDFs:
 * - PDFs creados desde cero (usando pdfkit)
 * - PDFs generados desde plantillas (usando pdf-lib)
 */
export class IPDFGenerator {
  /**
   * Genera un Recibo de Pago con diseño institucional mejorado
   * 
   * Crea un PDF desde cero usando IncosPDFBase + pdfkit.
   * 
   * @param {Object} data - Datos del pago
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  generateReciboPagoMejorado(data, outputPath) {
    throw new Error('Method generateReciboPagoMejorado must be implemented');
  }

  /**
   * Genera un Acta de Compromiso a partir de la plantilla PDF
   * 
   * Edita la plantilla PDF (Plantilla.pdf) usando pdf-lib.
   * 
   * @returns {Promise<Buffer>} Contenido del PDF generado
   */
  generateActaCompromiso() {
    throw new Error('Method generateActaCompromiso must be implemented');
  }
}
