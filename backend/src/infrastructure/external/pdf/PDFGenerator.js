/**
 * PDFGenerator - Clase principal para generación de PDFs del Instituto INCOS
 * 
 * Esta clase sirve como fachada para todos los generadores de PDF específicos.
 * Cada tipo de documento tiene su propio generador especializado que extiende
 * de IncosPDFBase para mantener consistencia visual y funcional.
 * 
 * Generadores disponibles:
 * - FormularioInscripcionGenerator: Formularios de inscripción
 * - ActaCompromisoGenerator: Actas de compromiso para documentos
 * - ReciboPagoGenerator: Recibos de pago y aranceles (implementación directa)
 * 
 * Uso:
 * await PDFGenerator.generateFormularioInscripcion(data, outputPath);
 * await PDFGenerator.generateCompromisoActa(data, outputPath);
 * await PDFGenerator.generateReciboPago(data, outputPath);
 */

import { FormularioInscripcionGenerator } from './FormularioInscripcionGenerator.js';
import { ActaCompromisoGenerator } from './ActaCompromisoGenerator.js';
import { IncosPDFBase } from './IncosPDFBase.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class PDFGenerator {
  // ============================================
  // GENERADORES ESPECÍFICOS
  // ============================================

  /**
   * Genera el Formulario de Inscripción
   * 
   * @param {Object} data - Datos del estudiante y de la inscripción
   * @param {string} data.gestionYear - Año de la gestión
   * @param {string} data.apellidoPaterno - Apellido paterno
   * @param {string} data.apellidoMaterno - Apellido materno
   * @param {string} data.nombres - Nombres
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.expedicion - Lugar de expedición del CI
   * @param {string} data.genero - Género (Masculino/Femenino)
   * @param {string} data.tipoSangre - Tipo sanguíneo
   * @param {string} data.emailPersonal - Email personal
   * @param {string} data.estadoCivil - Estado civil
   * @param {boolean} data.tieneDiscapacidad - Si tiene discapacidad
   * @param {string} data.ciudadNacimiento - Ciudad de nacimiento
   * @param {string} data.provincia - Provincia
   * @param {string} data.departamento - Departamento
   * @param {string} data.fechaNacimiento - Fecha de nacimiento (formato DD/MM/YYYY)
   * @param {string} data.nacionalidad - Nacionalidad
   * @param {string} data.edad - Edad
   * @param {string} data.direccion - Dirección
   * @param {string} data.idiomaMaterno - Idioma materno
   * @param {string} data.celular - Número de celular
   * @param {string} data.carrera - Nombre de la carrera
   * @param {string} data.anio - Año académico (Primer Año, Segundo Año, etc.)
   * @param {Object} data.documentos - Estado de documentos entregados
   * @param {boolean} data.documentos.ci - CI entregado
   * @param {boolean} data.documentos.certificadoNacimiento - Certificado entregado
   * @param {boolean} data.documentos.diplomaBachiller - Diploma entregado
   * @param {boolean} data.documentos.aporteVoluntario - Aporte realizado
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   gestionYear: 2026,
   *   apellidoPaterno: 'Pérez',
   *   apellidoMaterno: 'García',
   *   nombres: 'Juan Carlos',
   *   ci: '12345678',
   *   expedicion: 'S.C.',
   *   genero: 'Masculino',
   *   // ... más datos
   *   documentos: {
   *     ci: true,
   *     certificadoNacimiento: true,
   *     diplomaBachiller: false,
   *     aporteVoluntario: true,
   *   },
   * };
   * 
   * await PDFGenerator.generateFormularioInscripcion(data, '/path/to/output.pdf');
   */
  static async generateFormularioInscripcion(data, outputPath) {
    return await FormularioInscripcionGenerator.generate(data, outputPath);
  }

  /**
   * Genera el Acta de Compromiso para la Entrega de Documentos
   * 
   * @param {Object} data - Datos del estudiante y del compromiso
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.expedicion - Lugar de expedición del CI (default: 'S.C.')
   * @param {string} data.ciudad - Ciudad donde se firma el acta
   * @param {Date|string} data.fecha - Fecha del acta (default: fecha actual)
   * @param {number} data.dia - Día del mes
   * @param {string} data.mes - Nombre del mes
   * @param {number} data.anio - Año
   * @param {string} data.anioCarrera - Año de la carrera (opcional)
   * @param {string} data.paralelo - Paralelo (opcional)
   * @param {string} data.carrera - Nombre de la carrera (opcional)
   * @param {Array<string>} data.documentosRequeridos - Lista de documentos requeridos
   * @param {Array<number>} data.documentosEntregados - Índices de documentos ya entregados
   * @param {number} data.plazoMaximo - Plazo en días para completar documentos (default: 10)
   * @param {string} data.motivos - Motivos por los que no se presentaron documentos
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   nombreCompleto: 'Juan Carlos Pérez García',
   *   ci: '12345678',
   *   expedicion: 'S.C.',
   *   ciudad: 'Santa Cruz de la Sierra',
   *   fecha: new Date(),
   *   anioCarrera: 'Segundo',
   *   paralelo: 'A',
   *   carrera: 'Contaduría General',
   *   documentosRequeridos: [
   *     'Diploma de Bachiller',
   *     'Certificado de Nacimiento',
   *     'Carnet de Identidad',
   *     'Foto 3x3 fondo rojo',
   *     'Folder con nepaco',
   *   ],
   *   documentosEntregados: [2, 4], // Índices de documentos entregados (CI y Folder)
   *   plazoMaximo: 10,
   *   motivos: 'Actualización de carta aval del presente año.',
   * };
   * 
   * await PDFGenerator.generateCompromisoActa(data, '/path/to/output.pdf');
   */
  static async generateCompromisoActa(data, outputPath) {
    return await ActaCompromisoGenerator.generate(data, outputPath);
  }

  /**
   * Genera un Recibo de Pago
   * 
   * @param {Object} data - Datos del pago
   * @param {string} data.numeroRecibo - Número del recibo
   * @param {string} data.fechaPago - Fecha del pago
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.carrera - Nombre de la carrera (opcional)
   * @param {string} data.gestion - Gestión (opcional)
   * @param {string} data.concepto - Concepto del pago
   * @param {number} data.montoTotal - Monto total a pagar
   * @param {number} data.descuentoBeca - Descuento por beca (opcional)
   * @param {string} data.metodoPago - Método de pago (Efectivo, Transferencia, etc.)
   * @param {string} data.numeroTransaccion - Número de transacción (opcional)
   * @param {string} data.banco - Nombre del banco (opcional)
   * @param {string} data.estado - Estado del pago (PENDIENTE, APROBADO, etc.)
   * 
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   * 
   * @example
   * const data = {
   *   numeroRecibo: 'REC-2026-001',
   *   fechaPago: '19/01/2026',
   *   nombreCompleto: 'Juan Carlos Pérez García',
   *   ci: '12345678',
   *   carrera: 'Sistemas Informáticos',
   *   gestion: '2026',
   *   concepto: 'Aporte Voluntario Anual',
   *   montoTotal: 500.00,
   *   descuentoBeca: 100.00,
   *   metodoPago: 'Transferencia Bancaria',
   *   numeroTransaccion: 'TRX123456',
   *   banco: 'Banco Nacional de Bolivia',
   *   estado: 'APROBADO',
   * };
   * 
   * await PDFGenerator.generateReciboPago(data, '/path/to/output.pdf');
   */
  static async generateReciboPago(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Encabezado institucional usando colores y estilos de IncosPDFBase
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor(IncosPDFBase.COLORS.primary)
          .text(IncosPDFBase.INSTITUTE.name, {
            align: 'center',
          })
          .font('Helvetica')
          .fontSize(10)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(IncosPDFBase.INSTITUTE.motto, {
            align: 'center',
          })
          .moveDown(1.5);

        // Título
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor(IncosPDFBase.COLORS.primary)
          .text('RECIBO DE PAGO - APORTE VOLUNTARIO', {
            align: 'center',
          })
          .moveDown(1);

        // Número de recibo y fecha
        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor(IncosPDFBase.COLORS.text)
          .text(`Recibo Nº: ${data.numeroRecibo || 'N/A'}`, { align: 'left' })
          .text(`Fecha: ${data.fechaPago || new Date().toLocaleDateString('es-BO')}`, {
            align: 'left',
          })
          .moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke(IncosPDFBase.COLORS.border)
          .moveDown(1);

        // Datos del estudiante
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor(IncosPDFBase.COLORS.text)
          .text('DATOS DEL ESTUDIANTE', { continued: false })
          .moveDown(0.5)
          .font('Helvetica')
          .fontSize(11)
          .text(`Nombre: ${data.nombreCompleto || 'N/A'}`, { indent: 20 })
          .text(`C.I.: ${data.ci || 'N/A'}`, { indent: 20 });

        if (data.carrera) {
          doc.text(`Carrera: ${data.carrera}`, { indent: 20 });
        }
        if (data.gestion) {
          doc.text(`Gestión: ${data.gestion}`, { indent: 20 });
        }

        doc.moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke(IncosPDFBase.COLORS.border)
          .moveDown(1);

        // Detalle del pago
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor(IncosPDFBase.COLORS.text)
          .text('DETALLE DEL PAGO', { continued: false })
          .moveDown(0.5)
          .font('Helvetica')
          .fontSize(11);

        // Tabla de detalles
        const tableLeft = 70;
        const tableTop = doc.y;

        doc
          .font('Helvetica-Bold')
          .text('Concepto:', tableLeft, tableTop, { width: 150 })
          .font('Helvetica')
          .text(data.concepto || 'Aporte Voluntario Anual', tableLeft + 150, tableTop, {
            width: 330,
          });

        let row2Y = tableTop + 25;
        doc
          .font('Helvetica-Bold')
          .text('Monto Total:', tableLeft, row2Y, { width: 150 })
          .font('Helvetica')
          .text(`Bs. ${(data.montoTotal || 0).toFixed(2)}`, tableLeft + 150, row2Y, {
            width: 330,
          });

        let row3Y = row2Y + 25;
        if (data.descuentoBeca > 0) {
          doc
            .font('Helvetica-Bold')
            .text('Descuento por Beca:', tableLeft, row3Y, { width: 150 })
            .font('Helvetica')
            .text(`Bs. ${data.descuentoBeca.toFixed(2)}`, tableLeft + 150, row3Y, {
              width: 330,
            });
          row3Y += 25;
        }

        const montoAPagar = (data.montoTotal || 0) - (data.descuentoBeca || 0);
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(IncosPDFBase.COLORS.primary)
          .text('MONTO A PAGAR:', tableLeft, row3Y, { width: 150 })
          .font('Helvetica')
          .fontSize(12)
          .fillColor(IncosPDFBase.COLORS.text)
          .text(`Bs. ${montoAPagar.toFixed(2)}`, tableLeft + 150, row3Y, {
            width: 330,
          });

        let row5Y = row3Y + 30;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('Método de Pago:', tableLeft, row5Y, { width: 150 })
          .font('Helvetica')
          .fontSize(11)
          .text(data.metodoPago || 'N/A', tableLeft + 150, row5Y, { width: 330 });

        if (data.numeroTransaccion) {
          const row6Y = row5Y + 25;
          doc
            .font('Helvetica-Bold')
            .text('Número de Transacción:', tableLeft, row6Y, { width: 150 })
            .font('Helvetica')
            .text(data.numeroTransaccion, tableLeft + 150, row6Y, { width: 330 });
          row5Y = row6Y;
        }

        if (data.banco) {
          const row7Y = row5Y + 25;
          doc
            .font('Helvetica-Bold')
            .text('Banco:', tableLeft, row7Y, { width: 150 })
            .font('Helvetica')
            .text(data.banco, tableLeft + 150, row7Y, { width: 330 });
        }

        doc.moveDown(1.5);

        // Estado del pago
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(IncosPDFBase.COLORS.text)
          .text(`Estado: ${data.estado || 'PENDIENTE'}`, { align: 'left' });

        doc.moveDown(2);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke(IncosPDFBase.COLORS.border)
          .moveDown(1.5);

        // Firmas
        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor(IncosPDFBase.COLORS.text)
          .text('_________________________', { indent: 20 })
          .moveDown(0.3)
          .text('Firma del Estudiante', { indent: 20 })
          .moveDown(1.5);

        doc
          .text('_________________________', { indent: 350 })
          .moveDown(0.3)
          .text('Firma del Cajero', { indent: 350 });

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
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
