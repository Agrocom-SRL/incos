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
   * Crea un PDF desde cero usando pdf-lib (ReciboPagoPdfGenerator).
   *
   * @param {Object} data - Datos del pago
   * @returns {Promise<Buffer>} Contenido del PDF generado
   */
  generateReciboPago(data) {
    throw new Error('Method generateReciboPago must be implemented');
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

  /**
   * Genera un Formulario de Declaración Jurada (Traspaso / Transitabilidad)
   * a partir de la plantilla PDF.
   *
   * Edita la plantilla PDF usando pdf-lib (DeclaracionJuradaPdfGenerator),
   * reutilizando la estructura base del formulario de inscripción pero con
   * secciones adaptadas.
   *
   * @param {Object} [options] - Opciones (gestion, student, academicData, enrollmentData, entregas, tipoAdmision, fechaActual, etc.)
   * @returns {Promise<Buffer>} Contenido del PDF generado
   */
  generateFormularioDeclaracionJurada(options = {}) {
    throw new Error('Method generateFormularioDeclaracionJurada must be implemented');
  }

  /**
   * Genera un Formulario de Inscripción a partir de la plantilla PDF
   *
   * Edita la plantilla PDF (Plantilla.pdf) usando pdf-lib (FormularioInscripcionPdfGenerator).
   *
   * @param {Object} [options] - Opciones (gestionYear, apellidoPaterno, apellidoMaterno, nombres, ci, expedicion, etc.)
   * @returns {Promise<Buffer>} Contenido del PDF generado
   */
  generateFormularioInscripcion(options = {}) {
    throw new Error('Method generateFormularioInscripcion must be implemented');
  }
}
