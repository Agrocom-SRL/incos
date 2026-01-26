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
 *   y delega en generadores específicos (ReciboPagoPdfGenerator, ActaCompromisoPdfGenerator)
 * 
 * Generadores disponibles:
 * - ReciboPagoPdfGenerator: Recibos de pago (crea desde cero con pdf-lib)
 * - ActaCompromiso: Actas de compromiso (edita plantilla PDF)
 * - FormularioInscripcion: Formulario de inscripción (edita plantilla PDF)
 * 
 * @module PDFGenerator
 * @implements {IPDFGenerator}
 */

import { IPDFGenerator } from '../../../domain/interfaces/services/IPDFGenerator.js';

export class PDFGenerator extends IPDFGenerator {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.actaCompromisoPdfGenerator - Generador de actas (DI)
     * @param {Object} params.formularioInscripcionPdfGenerator - Generador de formulario de inscripción (DI)
     * @param {Object} params.reciboPagoPdfGenerator - Generador de recibos de pago (DI)
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ actaCompromisoPdfGenerator, formularioInscripcionPdfGenerator, reciboPagoPdfGenerator, logger } = {}) {
        super();
        this.actaCompromisoPdfGenerator = actaCompromisoPdfGenerator;
        this.formularioInscripcionPdfGenerator = formularioInscripcionPdfGenerator;
        this.reciboPagoPdfGenerator = reciboPagoPdfGenerator;
        this.logger = logger;
    }

    // ============================================
    // GENERADORES QUE CREAN DESDE CERO (pdf-lib)
    // ============================================

    /**
     * Genera un Recibo de Pago con diseño institucional
     * 
     * Este generador crea PDFs desde cero usando IncosPDFLibBase + pdf-lib.
     * Retorna Buffer en lugar de escribir en disco.
     * 
     * @param {Object} data - Datos del pago
     * @param {string} data.numeroRecibo - Número del recibo (FAV)
     * @param {string} data.fechaPago - Fecha del pago (formato YYYY-MM-DD o DD/MM/YYYY)
     * @param {string} data.nombreCompleto - Nombre completo del estudiante
     * @param {string} data.ci - Cédula de identidad
     * @param {string} [data.carrera] - Nombre de la carrera (opcional)
     * @param {string} [data.cursoParalelo] - Curso y paralelo (opcional)
     * @param {string} [data.anio] - Año académico (opcional)
     * @param {number} data.montoTotal - Monto total del aporte
     * @param {number} data.descuentoBeca - Descuento por beca
     * @param {number} data.montoPagado - Monto pagado (totalAmount - descuentoBeca)
     * @param {string} data.concepto - Concepto del pago
     * @param {string} data.metodoPago - Método de pago
     * @param {string} [data.numeroTransaccion] - Número de transacción (opcional)
     * @param {Object} [data.becaInfo] - Información de beca (opcional)
     * @returns {Promise<Buffer>} Buffer del PDF generado
     * 
     * @example
     * const pdfBuffer = await pdfGenerator.generateReciboPago(data);
     */
    async generateReciboPago(data) {
        if (!this.reciboPagoPdfGenerator) {
            throw new Error(
                'ReciboPagoPdfGenerator no está inyectado. ' +
                'Asegúrate de registrar PDFGenerator en el container con todas sus dependencias.'
            );
        }

        return await this.reciboPagoPdfGenerator.generate(data);
    }

    // ============================================
    // GENERADORES QUE USAN PLANTILLAS (pdf-lib)
    // ============================================

    /**
     * Genera un Acta de Compromiso a partir de la plantilla PDF
     * 
     * Este generador edita la plantilla PDF (Plantilla.pdf) usando pdf-lib.
     * 
     * @param {Object} [options] - Opciones para la generación
     * @param {string|number} [options.gestion] - Año de gestión (ej: '2026' o 2026). Si no se proporciona, usa el año actual
     * @returns {Promise<Buffer>} Contenido del PDF generado
     * 
     * @example
     * const pdfBuffer = await pdfGenerator.generateActaCompromiso();
     * const pdfBuffer = await pdfGenerator.generateActaCompromiso({ gestion: 2026 });
     */
    async generateActaCompromiso(options = {}) {
        if (!this.actaCompromisoPdfGenerator) {
            throw new Error(
                'ActaCompromisoPdfGenerator no está inyectado. ' +
                'Asegúrate de registrar PDFGenerator en el container con todas sus dependencias.'
            );
        }

        return await this.actaCompromisoPdfGenerator.generate(options);
    }

    /**
     * Genera un Formulario de Inscripción a partir de la plantilla PDF
     *
     * Delega en FormularioInscripcionPdfGenerator (pdf-lib).
     *
     * @param {Object} [options] - Opciones (gestionYear, apellidoPaterno, apellidoMaterno, nombres, ci, expedicion, etc.)
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generateFormularioInscripcion(options = {}) {
        if (!this.formularioInscripcionPdfGenerator) {
            throw new Error(
                'FormularioInscripcionPdfGenerator no está inyectado. ' +
                'Asegúrate de registrar PDFGenerator en el container con todas sus dependencias.'
            );
        }

        return await this.formularioInscripcionPdfGenerator.generate(options);
    }

    // ============================================
    // MÉTODOS ESTÁTICOS (para compatibilidad)
    // ============================================

    /**
     * Genera un Recibo de Pago (método estático para compatibilidad)
     * 
     * @deprecated Usa el método de instancia generateReciboPago() en su lugar
     * Este método ya no está disponible. Usa una instancia de PDFGenerator con el método generateReciboPago()
     * @param {Object} data - Datos del pago
     * @param {string} outputPath - Ruta donde guardar el PDF
     * @returns {Promise<string>} Ruta del archivo generado
     * @throws {Error} Este método estático ya no está disponible
     */
    static async generateReciboPago(data, outputPath) {
        throw new Error(
            'El método estático generateReciboPago() ya no está disponible. ' +
            'Usa una instancia de PDFGenerator con el método generateReciboPago() que retorna un Buffer.'
        );
    }
}
