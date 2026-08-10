/**
 * AvanceTutoriaCarreraPdfGenerator (módulo TIT · titulación, Requisito 2 —
 * extensión 2026-07-31)
 *
 * Genera el PDF del REPORTE DE AVANCE DE TUTORÍAS POR CARRERA a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib. Patrón
 * PanelAcompanamientoPdfGenerator: tabla agregada por carrera (vista 179) +
 * tabla de detalle por proyecto (vista 160).
 *
 * Tipografía +2pt sobre el default institucional (`IncosPDFBase.FONTS`) en
 * TODO el contenido de este reporte — pedido explícito, exclusivo de este
 * generador (los overrides de `options.fontSize` en `IncosPDFLibBase` no
 * afectan a ningún otro PDF del sistema).
 *
 * Tabla de detalle con `options.paginate` (`_addTable` en `IncosPDFLibBase`):
 * cuando la gestión tiene muchos proyectos, la tabla ya no invade el pie de
 * la plantilla — cierra la página, agrega una nueva copiando la plantilla
 * (`_addTemplatePage`) y repite el encabezado. El piso de esa tabla reserva
 * además el alto del bloque de firma (`DETALLE_FOOTER_RESERVE`), que se
 * agrega siempre al final de la ÚLTIMA página (sea la primera o no).
 *
 * @implements {IAvanceTutoriaCarreraPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

/** +2pt sobre `IncosPDFBase.FONTS` para cada elemento usado en este reporte. */
const FONT_SIZES = {
  title: 16, // FONTS.title.size (14) + 2
  subtitle: 14, // FONTS.subtitle.size (12) + 2
  section: 12, // FONTS.section.size (10) + 2
  paragraph: 10, // FONTS.normal.size (8) + 2
  tableHeader: 10, // FONTS.normal.size (8) + 2
  tableBody: 8, // FONTS.small.size (6) + 2
};

/**
 * Piso reservado (además de margins.bottom) para la tabla de detalle: pie
 * visual de la plantilla (LAYOUT.signatureTemplateFooterHeight = 45) + alto
 * del bloque de firma que se dibuja después (línea + 2 líneas de texto +
 * paddings de `_addSignatureBlock`) + margen de aire — así la última fila
 * nunca queda debajo de la firma.
 */
const DETALLE_FOOTER_RESERVE = 95;

/** Firma institucional al pie de la última página (mismo rol que `DesignacionTutorPdfGenerator`). */
const FIRMA_LINES = ['DIRECCIÓN ACADÉMICA', 'Instituto INCOS'];

export class AvanceTutoriaCarreraPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IAvanceTutoriaCarreraPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('REPORTE DE AVANCE DE TUTORÍAS POR CARRERA', true, {
        fontSize: FONT_SIZES.title,
      });
      if (options.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.gestionAnio}`, { fontSize: FONT_SIZES.subtitle });
      }
      this._addSpace();

      await this._buildResumenPorCarrera(options);
      await this._buildDetallePorProyecto(options);
      await this._addSignatureBlock({ lines: FIRMA_LINES, fontSize: FONT_SIZES.paragraph });

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[AvanceTutoriaCarreraPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[AvanceTutoriaCarreraPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /** @private */
  async _buildResumenPorCarrera(options) {
    const filas = Array.isArray(options.resumenPorCarrera) ? options.resumenPorCarrera : [];
    await this._addSection('RESUMEN POR CARRERA', false, { fontSize: FONT_SIZES.section });
    if (filas.length === 0) {
      await this._addParagraph('Sin proyectos de grado registrados para la gestión seleccionada.', {
        fontSize: FONT_SIZES.paragraph,
      });
      return;
    }
    await this._addTable(
      ['Carrera', 'Proyectos', '% avance promedio', 'Con observaciones pendientes'],
      [220, 80, 110, 90],
      filas.map((fila) => [
        fila.carreraNombre ?? '',
        String(fila.totalProyectos ?? 0),
        fila.promedioAvance != null ? `${fila.promedioAvance}%` : '—',
        String(fila.proyectosConObservacionesPendientes ?? 0),
      ]),
      null,
      [],
      null,
      { fontSize: FONT_SIZES.tableBody, headerFontSize: FONT_SIZES.tableHeader },
    );
    this._addSpace();
  }

  /** @private */
  async _buildDetallePorProyecto(options) {
    const filas = Array.isArray(options.detalle) ? options.detalle : [];
    if (filas.length === 0) return;
    await this._addSection('DETALLE POR PROYECTO', false, { fontSize: FONT_SIZES.section });
    await this._addTable(
      ['Título', 'Carrera', 'Tutor', '% avance', 'Última observación'],
      [150, 100, 100, 60, 90],
      filas.map((fila) => [
        fila.titulo ?? '',
        fila.carreraNombre ?? '',
        fila.tutorNombre ?? '—',
        fila.porcentajeAvance != null ? `${fila.porcentajeAvance}%` : '—',
        fila.ultimaObservacion ?? '—',
      ]),
      null,
      [],
      null,
      {
        fontSize: FONT_SIZES.tableBody,
        headerFontSize: FONT_SIZES.tableHeader,
        paginate: true,
        footerHeight: DETALLE_FOOTER_RESERVE,
      },
    );
  }
}
