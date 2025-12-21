/**
 * Servicio de generación de PDFs
 * Usa PDFKit para generar documentos PDF
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFGenerator {
  /**
   * Genera el ACTA DE COMPROMISO para la entrega de documentos
   * @param {Object} data - Datos del estudiante y del acta
   * @param {string} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generateCompromisoActa(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        // Pipe al archivo
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Encabezado
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS', {
            align: 'center',
          })
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ', {
            align: 'center',
          })
          .font('Helvetica')
          .text('PIONEROS EN EDUCACION SUPERIOR', {
            align: 'center',
          })
          .moveDown(1);

        // Sección I: FECHA DE REGISTRO
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('I. FECHA DE REGISTRO', { continued: false })
          .font('Helvetica')
          .text(`Ciudad: ${data.ciudad || 'Santa Cruz de la Sierra'}`)
          .text(`Día: ${data.dia || new Date().getDate()}`)
          .text(`Mes: ${data.mes || PDFGenerator.getMonthName(new Date().getMonth())}`)
          .text(`Año: ${data.anio || new Date().getFullYear()}`)
          .moveDown(0.5);

        // Sección II: NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION
        doc
          .font('Helvetica-Bold')
          .text('II. NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION', {
            continued: false,
          })
          .font('Helvetica')
          .text(`Nombre: ${data.nombreCompleto || ''}`)
          .text(`C.I. Nº: ${data.ci || ''} ${data.expedicion || 'S.C.'}`)
          .moveDown(0.5);

        // Sección III: AÑO Y CARRERA A LA QUE POSTULA
        doc
          .font('Helvetica-Bold')
          .text('III. AÑO Y CARRERA A LA QUE POSTULA', { continued: false })
          .font('Helvetica')
          .text(`Del (From) Año: ${data.anioCarrera || ''}`)
          .text(`Paralelo: ${data.paralelo || ''}`)
          .text(`Carrera: ${data.carrera || ''}`)
          .moveDown(0.5);

        // Sección IV: REQUISITOS
        doc
          .font('Helvetica-Bold')
          .text(
            'IV. Marcar con una "X" en el recuadro, el requisito que no está presentando',
            { continued: false }
          )
          .moveDown(0.3);

        const requisitos = [
          'Copia de simple del Diploma de Bachiller',
          'Copia Simple Certificado de nacimiento',
          'Copia simple del Carnet de identidad',
          'Una foto 3 x 3 fondo rojo',
          'Folder con nepaco',
        ];

        requisitos.forEach((requisito, index) => {
          const tieneX = data.documentosFaltantes?.includes(index);
          doc
            .font('Helvetica')
            .text(`[${tieneX ? 'X' : ' '}] ${requisito}`, {
              indent: 20,
            });
        });

        doc.moveDown(0.5);

        // COMPROMISO
        doc
          .font('Helvetica-Bold')
          .text('COMPROMISO:', { continued: false })
          .font('Helvetica')
          .text(
            'Me comprometo completar la documentación Faltante.',
            { indent: 20 }
          )
          .text(`Plazo máximo: ${data.plazoMaximo || '10'} días a partir de la fecha de registro.`)
          .moveDown(0.5);

        // MOTIVOS
        doc
          .font('Helvetica-Bold')
          .text('Motivos:', { continued: false })
          .font('Helvetica')
          .text(data.motivos || 'Actualización de carta aval del presente año.', {
            indent: 20,
          })
          .moveDown(0.5);

        // DECLARACIÓN FINAL
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            'Una vez vencido el plazo y en caso de no haber completado los requisitos exigidos por el Instituto Técnico INCOS SANTA CRUZ; me sujeto a las disposiciones de las Autoridades del Instituto.',
            { indent: 20 }
          )
          .moveDown(1);

        // FIRMA
        doc
          .font('Helvetica')
          .fontSize(11)
          .text('Firma:', { continued: false })
          .moveDown(2)
          .text('_________________________')
          .moveDown(0.3)
          .text(`C.I. ${data.ci || ''} ${data.expedicion || 'S.C.'}`);

        // Finalizar documento
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

