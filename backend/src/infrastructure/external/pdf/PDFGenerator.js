/**
 * PDFGenerator - Clase principal para generación de PDFs del Instituto INCOS
 * 
 * Esta clase sirve como fachada para todos los generadores de PDF específicos.
 * Cada tipo de documento tiene su propio generador especializado que extiende
 * de IncosPDFBase para mantener consistencia visual y funcional.
 * 
 * Generadores disponibles:
 * - ReciboPagoMejorado: Recibos de pago con diseño institucional mejorado (NUEVO)
 * 
 * NOTA: Las Actas de Compromiso ahora se generan usando ActaCompromisoWordGenerator
 * que genera DOCX desde plantilla Word y luego lo convierte a PDF.
 * 
 * NOTA: FormularioInscripcionGenerator y ReciboPagoGenerator están comentados hasta que se implementen.
 * 
 * Uso:
 * await PDFGenerator.generateReciboPagoMejorado(data, outputPath); // Versión mejorada (RECOMENDADA)
 */

import { ReciboPagoMejorado } from './ReciboPagoMejorado.js';

export class PDFGenerator {
  // ============================================
  // GENERADORES ESPECÍFICOS
  // ============================================

  /**
   * Genera el Formulario de Inscripción
   * 
   * TODO: Este método está comentado hasta que se implemente FormularioInscripcionGenerator
   * 
   * @param {Object} data - Datos del estudiante y de la inscripción
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  // static async generateFormularioInscripcion(data, outputPath) {
  //   return await FormularioInscripcionGenerator.generate(data, outputPath);
  // }

  /**
   * Genera un Recibo de Pago con diseño institucional mejorado (RECOMENDADA)
   * 
   * Este es el nuevo generador de recibos que sigue el diseño institucional
   * estándar con tabla de datos personales, declaración jurada y formato
   * profesional.
   * 
   * @param {Object} data - Datos del pago
   * @param {Object} [data.institutoInfo] - Información personalizada del instituto
   * @param {string} data.numeroRecibo - Número del recibo (FAV)
   * @param {string} data.fechaPago - Fecha del pago (formato YYYY-MM-DD o DD/MM/YYYY)
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.carrera - Nombre de la carrera
   * @param {number} data.montoTotal - Monto total del aporte
   * @param {number} data.montoPagado - Monto pagado (totalAmount - descuentoBeca)
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * await PDFGenerator.generateReciboPagoMejorado(data, '/path/to/output.pdf');
   */
  static async generateReciboPagoMejorado(data, outputPath) {
    return await ReciboPagoMejorado.generate(data, outputPath);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Obtiene el nombre del mes en español
   * @param {number} monthIndex - Índice del mes (0-11)
   * @returns {string} Nombre del mes
   */
  static getMonthName(monthIndex) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[monthIndex] || '';
  }
}
