/**
 * PDFGenerator - Adaptador de generación de PDFs que implementa IPDFGenerator
 * 
 * Esta clase implementa IPDFGenerator y sirve como fachada única para todos los generadores de PDF:
 * - Generadores que crean PDFs desde cero (usando IncosPDFBase + pdfkit)
 * - Generadores que editan plantillas PDF (usando pdf-lib)
 * 
 * Se registra en el container DI y se inyecta en use cases.
 * 
 * Clean Architecture:
 * - Domain: IPDFGenerator (interfaz)
 * - Infrastructure: PDFGenerator implementa IPDFGenerator
 *   y delega en generadores específicos (ReciboPagoMejorado, ActaCompromisoPdfGenerator)
 * 
 * Generadores disponibles:
 * - ReciboPagoMejorado: Recibos de pago (crea desde cero)
 * - ActaCompromiso: Actas de compromiso (edita plantilla PDF)
 * 
 * @module PDFGenerator
 * @implements {IPDFGenerator}
 */

import { IPDFGenerator } from '../../../domain/interfaces/services/IPDFGenerator.js';
import { ReciboPagoMejorado } from './ReciboPagoMejorado.js';

export class PDFGenerator extends IPDFGenerator {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.actaCompromisoPdfGenerator - Generador de actas (DI)
   * @param {ILogger} [params.logger] - Logger para registro de eventos
   */
  constructor({ actaCompromisoPdfGenerator, logger } = {}) {
    super();
    this.actaCompromisoPdfGenerator = actaCompromisoPdfGenerator;
    this.logger = logger;
  }

  // ============================================
  // GENERADORES QUE CREAN DESDE CERO (pdfkit)
  // ============================================

  /**
   * Genera un Recibo de Pago con diseño institucional mejorado
   * 
   * Este generador crea PDFs desde cero usando IncosPDFBase + pdfkit.
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
   * await pdfGenerator.generateReciboPagoMejorado(data, '/path/to/output.pdf');
   */
  async generateReciboPagoMejorado(data, outputPath) {
    return await ReciboPagoMejorado.generate(data, outputPath);
  }

  // ============================================
  // GENERADORES QUE USAN PLANTILLAS (pdf-lib)
  // ============================================

  /**
   * Genera un Acta de Compromiso a partir de la plantilla PDF
   * 
   * Este generador edita la plantilla PDF (Plantilla.pdf) usando pdf-lib.
   * 
   * @returns {Promise<Buffer>} Contenido del PDF generado
   * 
   * @example
   * const pdfBuffer = await pdfGenerator.generateActaCompromiso();
   */
  async generateActaCompromiso() {
    if (!this.actaCompromisoPdfGenerator) {
      throw new Error(
        'ActaCompromisoPdfGenerator no está inyectado. ' +
        'Asegúrate de registrar PDFGenerator en el container con todas sus dependencias.'
      );
    }

    return await this.actaCompromisoPdfGenerator.generateEmpty();
  }

  // ============================================
  // MÉTODOS ESTÁTICOS (para compatibilidad)
  // ============================================

  /**
   * Genera un Recibo de Pago (método estático para compatibilidad)
   * 
   * @deprecated Usa el método de instancia generateReciboPagoMejorado() en su lugar
   * @param {Object} data - Datos del pago
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generateReciboPagoMejorado(data, outputPath) {
    return await ReciboPagoMejorado.generate(data, outputPath);
  }
}
