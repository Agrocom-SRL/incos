/**
 * BitacoraMensualTutorPdfGenerator (módulo TUT · titulación)
 *
 * Genera el REPORTE MENSUAL DE TUTORÍAS por tutor (planilla DDE: tutorías
 * programadas/desarrolladas en el mes) a partir de la plantilla institucional
 * (Plantilla.pdf) con pdf-lib. Fuente de datos: vista 163
 * (vista_base_tutoria_bitacora_mensual_tutor), mapeada por el caso de uso.
 *
 * @implements {IBitacoraMensualTutorPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

export class BitacoraMensualTutorPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IBitacoraMensualTutorPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('REPORTE MENSUAL DE TUTORÍAS');
      const subtitulo = [
        options.mes ? `MES ${options.mes}` : null,
        options.gestionAnio ? `GESTIÓN ${options.gestionAnio}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      if (subtitulo) {
        await this._addSubtitle(subtitulo);
      }
      this._addSpace();

      const filas = Array.isArray(options.filas) ? options.filas : [];
      if (filas.length === 0) {
        await this._addParagraph('No existen tutorías registradas para el período seleccionado.');
      } else {
        await this._addSection('TUTORÍAS POR TUTOR');
        await this._addTable(
          ['Tutor', 'Carrera', 'Registradas', 'Confirmadas', 'Proyectos'],
          [160, 140, 70, 70, 60],
          filas.map((fila) => [
            fila.tutorNombre ?? '',
            fila.carreraNombre ?? '',
            String(fila.tutoriasRegistradas ?? 0),
            String(fila.tutoriasConfirmadas ?? 0),
            String(fila.proyectosAtendidos ?? 0),
          ])
        );
      }

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[BitacoraMensualTutorPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
        filas: filas.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[BitacoraMensualTutorPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
