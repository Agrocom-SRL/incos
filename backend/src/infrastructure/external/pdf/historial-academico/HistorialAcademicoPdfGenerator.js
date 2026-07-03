/**
 * HistorialAcademicoPdfGenerator
 *
 * Servicio de infraestructura que genera el HISTORIAL ACADÉMICO (documento
 * oficial FORM-SIE-ITT-04, kardex / transcript) de UN estudiante en PDF (tamaño
 * carta, vertical) SOBRE la plantilla institucional `Plantilla.pdf` —el mismo
 * soporte que el Boletín de Calificaciones—. La plantilla aporta el encabezado
 * con los logos institucionales y el pie de página verde; este generador solo
 * dibuja el contenido (título, datos, tabla del transcript, lugar y fecha,
 * firmas y pie con escala de valoración + resumen).
 *
 * Implementa IHistorialAcademicoPdfGenerator y extiende IncosPDFLibBase para
 * reutilizar la carga de la plantilla, las fuentes personalizadas, `_hexToRgb`,
 * `_wrapText` y el estado de documento. La tabla se dibuja a mano (no con
 * `_addTable`) para lograr el envolvimiento de texto en ASIGNATURA, la fila
 * TOTAL y el salto de página copiando la plantilla cuando el transcript es
 * largo.
 *
 * Principios SOLID:
 * - Single Responsibility: solo arma el historial; los datos llegan ya formados.
 * - Open/Closed: extiende IncosPDFLibBase sin modificarla.
 * - Métodos privados por sección (título, datos, tabla, fecha, firmas, pie).
 *
 * @module HistorialAcademicoPdfGenerator
 */

import { StandardFonts } from 'pdf-lib';
import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { HISTORIAL_ACADEMICO_PDF_CONFIG } from './historialAcademicoPdfConfig.js';
import {
  computeColumnGeometry,
  ordenarFilasHistorial,
  necesitaSaltoPagina
} from './historialAcademicoPdfLayout.js';

/** Piso de la tabla sobre el pie verde de la plantilla (Y mínima de una fila). */
const TABLA_FLOOR_Y = 110;
/** Altura estimada del bloque final (fecha + firmas + escala/resumen + leyenda). */
const BLOQUE_FINAL_ALTURA = 175;

export class HistorialAcademicoPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
    this._templateSource = null;
  }

  /**
   * Genera el PDF del historial académico de un estudiante.
   * @param {Object} payload - Contrato { estudiante, filas, resumen } de la API.
   * @returns {Promise<Buffer>}
   */
  async generarHistorialAcademico(payload = {}) {
    // La plantilla institucional aporta el encabezado (logos) y el pie de página
    // verde; _loadTemplate además registra fontkit para embeber la fuente britannic.
    const pdfDoc = await this._loadTemplate('Plantilla.pdf');
    const page = pdfDoc.getPages()[0];
    // useInitialY=true → el contenido arranca debajo del encabezado de la plantilla.
    this._initializeDocumentState(pdfDoc, page, true);
    this._templateSource = null; // fuente prístina para páginas extra (lazy)

    const fonts = {
      title: await this._loadCustomFont(pdfDoc, IncosPDFBase.FONTS.defaultTitleFont),
      normal: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    };

    const estudiante = payload?.estudiante ?? {};
    const filas = ordenarFilasHistorial(payload?.filas);
    const resumen = payload?.resumen ?? {};

    this._titulo(fonts);
    this._datosEstudiante(fonts, estudiante);
    await this._tablaTranscript(pdfDoc, fonts, filas, resumen);
    await this._bloqueFinal(pdfDoc, fonts, resumen);

    const buffer = await this._saveDocument(pdfDoc);

    if (this.logger) {
      this.logger.info('[HistorialAcademicoPdfGenerator] Historial generado (buffer)', {
        size: buffer.length,
        filas: filas.length,
        paginas: pdfDoc.getPageCount()
      });
    }

    return buffer;
  }

  // ============================================
  // SECCIONES
  // ============================================

  /**
   * Título "HISTORIAL ACADÉMICO" (fuente britannic, centrado, color primario).
   * @private
   */
  _titulo(fonts) {
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const title = 'HISTORIAL ACADÉMICO';
    const size = cfg.fonts.tituloSize;
    const titleWidth = this._safeWidth(fonts.title, title, size);
    page.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: this._currentY,
      size,
      font: fonts.title,
      color: this._hexToRgb(cfg.colors.primary)
    });
    this._currentY -= size + 16;
  }

  /**
   * Bloque de datos del estudiante a dos columnas (label:value), como el FORM
   * oficial: instituto/carrera/nivel/régimen/estudiante a la izquierda; fechas
   * de admisión/conclusión, matrícula y C.I. a la derecha.
   * @private
   */
  _datosEstudiante(fonts, est) {
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const contentWidth = pageWidth - margins.left - margins.right;
    const leftX = margins.left;
    const rightX = margins.left + contentWidth * 0.58;
    const leftMaxWidth = contentWidth * 0.56;
    const rightMaxWidth = contentWidth * 0.42;
    const size = cfg.fonts.datosSize;
    const lineGap = 15;

    const ciCompleto = [est.ci, est.expedicion].filter(Boolean).join(' ');
    const leftRows = [
      ['INSTITUTO: ', cfg.institutoNombre],
      ['CARRERA: ', est.carreraNombre ?? ''],
      ['NIVEL DE FORMACIÓN: ', est.nivelFormacion ?? ''],
      ['REGIMEN: ', est.regimen ?? ''],
      ['ESTUDIANTE: ', est.nombreCompleto ?? '']
    ];
    const rightRows = [
      ['FECHA DE ADMISIÓN: ', est.fechaAdmision ?? cfg.nullPlaceholder],
      ['FECHA DE CONCLUSIÓN: ', est.fechaConclusion ?? cfg.nullPlaceholder],
      ['MATRÍCULA: ', est.matricula ?? ''],
      ['CEDULA DE IDENTIDAD: ', ciCompleto]
    ];

    const totalRows = Math.max(leftRows.length, rightRows.length);
    for (let i = 0; i < totalRows; i += 1) {
      if (leftRows[i]) {
        this._drawLabelValue(
          page,
          fonts,
          leftX,
          this._currentY,
          leftRows[i][0],
          leftRows[i][1],
          leftMaxWidth,
          size
        );
      }
      if (rightRows[i]) {
        this._drawLabelValue(
          page,
          fonts,
          rightX,
          this._currentY,
          rightRows[i][0],
          rightRows[i][1],
          rightMaxWidth,
          size
        );
      }
      this._currentY -= lineGap;
    }

    this._currentY -= 8;
  }

  /**
   * Tabla del transcript dibujada a mano: cabecera verde con texto blanco que
   * envuelve, filas con altura dinámica (ASIGNATURA envuelve), fila final TOTAL
   * y salto de página (copiando la plantilla) cuando el transcript es largo.
   * La grilla se dibuja fila a fila para que cada segmento quede completo aunque
   * la tabla cruce de página.
   * @private
   */
  async _tablaTranscript(pdfDoc, fonts, filas, resumen) {
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const { margins } = IncosPDFBase.LAYOUT;
    const { width: pageWidth } = this._currentPage.getSize();
    const contentWidth = pageWidth - margins.left - margins.right;
    const cols = computeColumnGeometry({
      columns: cfg.columns,
      contentWidth,
      startX: margins.left
    });

    const colors = {
      primary: this._hexToRgb(cfg.colors.primary),
      headerText: this._hexToRgb(cfg.colors.headerText),
      text: this._hexToRgb(cfg.colors.text),
      border: this._hexToRgb(cfg.colors.border),
      tint: this._hexToRgb(cfg.colors.tint)
    };
    const { rowHeight, cellPadding, borderWidth } = cfg.table;
    const lineHeight = cfg.fonts.cellSize * 1.2;

    this._cabeceraTabla(fonts, cols, colors, contentWidth);

    // Filas de datos (altura dinámica si ASIGNATURA envuelve)
    for (const fila of filas) {
      const wrapCol = cols.find((c) => c.wrap);
      const asignaturaLines = wrapCol
        ? this._wrapText(
            String(fila[wrapCol.key] ?? ''),
            fonts.normal,
            cfg.fonts.cellSize,
            wrapCol.width - cellPadding * 2
          )
        : [''];
      const filaHeight = Math.max(
        rowHeight,
        asignaturaLines.length * lineHeight + cellPadding * 2
      );

      if (
        necesitaSaltoPagina({
          currentY: this._currentY,
          blockHeight: filaHeight,
          floorY: TABLA_FLOOR_Y
        })
      ) {
        // Salto de página secuencial: cada página nueva copia la plantilla.
        // eslint-disable-next-line no-await-in-loop
        await this._nuevaPagina(pdfDoc);
        this._cabeceraTabla(fonts, cols, colors, contentWidth);
      }

      const rowTopY = this._currentY;
      const rowBottomY = rowTopY - filaHeight;

      for (const col of cols) {
        if (col.wrap) {
          this._drawCellLines(
            fonts.normal,
            cfg.fonts.cellSize,
            asignaturaLines,
            col,
            rowBottomY,
            filaHeight,
            colors.text,
            cellPadding,
            col.align,
            lineHeight
          );
        } else {
          const value = this._formatCellValue(fila[col.key], col.key);
          if (value !== '') {
            this._drawCellText(
              fonts.normal,
              cfg.fonts.cellSize,
              value,
              col,
              rowBottomY,
              filaHeight,
              colors.text,
              cellPadding,
              col.align
            );
          }
        }
      }

      this._bordesFila(cols, colors.border, borderWidth, rowTopY, rowBottomY, contentWidth);
      this._currentY = rowBottomY;
    }

    // Fila final TOTAL: carga horaria acumulada bajo CARGA HORARIA
    if (
      necesitaSaltoPagina({
        currentY: this._currentY,
        blockHeight: rowHeight,
        floorY: TABLA_FLOOR_Y
      })
    ) {
      await this._nuevaPagina(pdfDoc);
      this._cabeceraTabla(fonts, cols, colors, contentWidth);
    }
    const totalTopY = this._currentY;
    const totalBottomY = totalTopY - rowHeight;
    this._currentPage.drawRectangle({
      x: margins.left,
      y: totalBottomY,
      width: contentWidth,
      height: rowHeight,
      color: colors.tint
    });
    for (const col of cols) {
      let value = '';
      let { align } = col;
      if (col.key === 'gestionAnio') {
        value = cfg.totalRowLabel;
        align = 'right';
      } else if (col.key === 'cargaHoraria') {
        value = String(resumen?.totalCargaHoraria ?? '');
      }
      if (value !== '') {
        this._drawCellText(
          fonts.bold,
          cfg.fonts.footerSize,
          value,
          col,
          totalBottomY,
          rowHeight,
          colors.text,
          cellPadding,
          align
        );
      }
    }
    this._bordesFila(cols, colors.border, borderWidth, totalTopY, totalBottomY, contentWidth);
    this._currentY = totalBottomY - 16;
  }

  /**
   * Cabecera verde de la tabla (se redibuja en cada página del transcript).
   * Las etiquetas envuelven en varias líneas dentro de su columna.
   * @private
   */
  _cabeceraTabla(fonts, cols, colors, contentWidth) {
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const { margins } = IncosPDFBase.LAYOUT;
    const { headerHeight, cellPadding, borderWidth } = cfg.table;
    const headerLineHeight = cfg.fonts.headerSize * 1.2;
    const topY = this._currentY;
    const bottomY = topY - headerHeight;

    this._currentPage.drawRectangle({
      x: margins.left,
      y: bottomY,
      width: contentWidth,
      height: headerHeight,
      color: colors.primary
    });
    for (const col of cols) {
      const lines = this._wrapText(
        col.label,
        fonts.bold,
        cfg.fonts.headerSize,
        col.width - cellPadding * 2
      );
      this._drawCellLines(
        fonts.bold,
        cfg.fonts.headerSize,
        lines,
        col,
        bottomY,
        headerHeight,
        colors.headerText,
        cellPadding,
        'center',
        headerLineHeight
      );
    }
    this._bordesFila(cols, colors.border, borderWidth, topY, bottomY, contentWidth);
    this._currentY = bottomY;
  }

  /**
   * Bloque final del documento: lugar y fecha, firmas, pie a dos bloques (escala
   * de valoración + resumen) y leyenda legal centrada. Si no cabe sobre el pie
   * verde de la plantilla, se pasa completo a una página nueva.
   * @private
   */
  async _bloqueFinal(pdfDoc, fonts, resumen) {
    if (
      necesitaSaltoPagina({
        currentY: this._currentY,
        blockHeight: BLOQUE_FINAL_ALTURA,
        floorY: IncosPDFBase.LAYOUT.margins.bottom + 45
      })
    ) {
      await this._nuevaPagina(pdfDoc);
    }
    this._lugarYFecha(fonts);
    this._firmas(fonts);
    this._pieEscalaYResumen(fonts, resumen);
    this._leyenda(fonts);
  }

  /**
   * Línea "Lugar y fecha: Santa Cruz, <fecha actual es-BO>".
   * @private
   */
  _lugarYFecha(fonts) {
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const { margins } = IncosPDFBase.LAYOUT;
    const fecha = new Intl.DateTimeFormat('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
    this._drawLabelValue(
      this._currentPage,
      fonts,
      margins.left,
      this._currentY,
      cfg.lugarFecha.etiqueta,
      `${cfg.lugarFecha.lugar}, ${fecha}`,
      this._currentPage.getSize().width - margins.left - margins.right,
      cfg.fonts.datosSize
    );
    this._currentY -= 40;
  }

  /**
   * Dos bloques de firma: DIRECTORA ACADÉMICA y RECTOR (label bajo la línea).
   * @private
   */
  _firmas(fonts) {
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const text = this._hexToRgb(cfg.colors.text);
    const border = this._hexToRgb(cfg.colors.border);
    const contentWidth = pageWidth - margins.left - margins.right;
    const lineWidth = 160;
    const y = this._currentY;

    for (const firma of cfg.firmas) {
      const centerX = margins.left + contentWidth * firma.centerRatio;
      page.drawLine({
        start: { x: centerX - lineWidth / 2, y },
        end: { x: centerX + lineWidth / 2, y },
        thickness: 0.8,
        color: border
      });
      const labelWidth = this._safeWidth(fonts.bold, firma.label, cfg.fonts.firmaSize);
      page.drawText(firma.label, {
        x: centerX - labelWidth / 2,
        y: y - 13,
        size: cfg.fonts.firmaSize,
        font: fonts.bold,
        color: text
      });
    }
    this._currentY = y - 13 - cfg.fonts.firmaSize - 18;
  }

  /**
   * Pie a dos bloques: tabla ESCALA DE VALORACIÓN a la izquierda y resumen
   * (carga horaria, aprobadas/total, promedio) a la derecha.
   * @private
   */
  _pieEscalaYResumen(fonts, resumen) {
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const escala = cfg.escalaValoracion;
    const text = this._hexToRgb(cfg.colors.text);
    const border = this._hexToRgb(cfg.colors.border);
    const contentWidth = pageWidth - margins.left - margins.right;
    const size = cfg.fonts.pieSize;
    const topY = this._currentY;

    // --- Bloque izquierdo: escala de valoración ---
    page.drawText(escala.titulo, {
      x: margins.left,
      y: topY,
      size,
      font: fonts.bold,
      color: text
    });
    let filaTopY = topY - 6;
    for (const filaEscala of escala.filas) {
      const filaBottomY = filaTopY - escala.rowHeight;
      // Grilla de la mini-tabla (2 columnas)
      page.drawRectangle({
        x: margins.left,
        y: filaBottomY,
        width: escala.anchoRango,
        height: escala.rowHeight,
        borderColor: border,
        borderWidth: 0.6
      });
      page.drawRectangle({
        x: margins.left + escala.anchoRango,
        y: filaBottomY,
        width: escala.anchoEtiqueta,
        height: escala.rowHeight,
        borderColor: border,
        borderWidth: 0.6
      });
      const textY = filaBottomY + (escala.rowHeight - size) / 2 + size * 0.3;
      const rangoWidth = this._safeWidth(fonts.normal, filaEscala.rango, size);
      page.drawText(filaEscala.rango, {
        x: margins.left + (escala.anchoRango - rangoWidth) / 2,
        y: textY,
        size,
        font: fonts.normal,
        color: text
      });
      page.drawText(filaEscala.etiqueta, {
        x: margins.left + escala.anchoRango + 6,
        y: textY,
        size,
        font: fonts.normal,
        color: text
      });
      filaTopY = filaBottomY;
    }

    // --- Bloque derecho: resumen del transcript ---
    const rightX = margins.left + contentWidth * 0.58;
    const rightMaxWidth = contentWidth * 0.42;
    const labels = cfg.resumenLabels;
    const aprobadas = `${resumen?.asignaturasAprobadas ?? 0}/${resumen?.asignaturasTotal ?? 0}`;
    const resumenRows = [
      [labels.cargaHoraria, String(resumen?.totalCargaHoraria ?? 0)],
      [labels.aprobadas, aprobadas],
      [labels.promedio, String(resumen?.promedioGeneral ?? cfg.nullPlaceholder)]
    ];
    let rightY = topY;
    for (const [label, value] of resumenRows) {
      this._drawLabelValue(page, fonts, rightX, rightY, label, value, rightMaxWidth, size);
      rightY -= escala.rowHeight;
    }

    this._currentY = Math.min(filaTopY, rightY) - 14;
  }

  /**
   * Leyenda legal centrada: "Cualquier raspadura o enmienda invalida...".
   * @private
   */
  _leyenda(fonts) {
    const page = this._currentPage;
    const { width: pageWidth } = page.getSize();
    const cfg = HISTORIAL_ACADEMICO_PDF_CONFIG;
    const size = cfg.fonts.leyendaSize;
    const textWidth = this._safeWidth(fonts.normal, cfg.leyenda, size);
    page.drawText(cfg.leyenda, {
      x: (pageWidth - textWidth) / 2,
      y: this._currentY,
      size,
      font: fonts.normal,
      color: this._hexToRgb(cfg.colors.text)
    });
    this._currentY -= size + 8;
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Agrega una página nueva copiando la plantilla prístina (encabezado con logos
   * y pie verde) y reinicia el cursor bajo el encabezado.
   * @private
   * @returns {Promise<PDFPage>}
   */
  async _nuevaPagina(pdfDoc) {
    if (!this._templateSource) {
      // Documento fuente separado: la página 0 del documento de trabajo ya tiene
      // contenido dibujado, así que no sirve como plantilla en blanco.
      this._templateSource = await this._loadTemplate('Plantilla.pdf');
    }
    const [page] = await pdfDoc.copyPages(this._templateSource, [0]);
    pdfDoc.addPage(page);
    this._currentPage = page;
    this._currentY = this._calculateInitialY(page);
    return page;
  }

  /**
   * Bordes de un segmento de fila: línea superior e inferior, verticales por
   * columna y borde derecho. Dibujar por fila permite que la grilla quede
   * completa aunque la tabla cruce de página.
   * @private
   */
  _bordesFila(cols, border, borderWidth, topY, bottomY, contentWidth) {
    const page = this._currentPage;
    const { margins } = IncosPDFBase.LAYOUT;
    this._hLine(page, margins.left, contentWidth, topY, border, borderWidth);
    this._hLine(page, margins.left, contentWidth, bottomY, border, borderWidth);
    for (const col of cols) {
      page.drawLine({
        start: { x: col.x, y: topY },
        end: { x: col.x, y: bottomY },
        thickness: borderWidth,
        color: border
      });
    }
    page.drawLine({
      start: { x: margins.left + contentWidth, y: topY },
      end: { x: margins.left + contentWidth, y: bottomY },
      thickness: borderWidth,
      color: border
    });
  }

  /**
   * Dibuja "label" (bold) + "value" (normal) en la misma línea, recortando el
   * valor al ancho disponible (mismo helper que el boletín).
   * @private
   */
  _drawLabelValue(page, fonts, x, y, label, value, maxWidth, size) {
    const textRgb = this._hexToRgb(HISTORIAL_ACADEMICO_PDF_CONFIG.colors.text);
    const labelStr = String(label ?? '');
    page.drawText(labelStr, { x, y, size, font: fonts.bold, color: textRgb });
    const labelWidth = this._safeWidth(fonts.bold, labelStr, size);
    const valueX = x + labelWidth + 2;
    const valueMaxWidth = Math.max(maxWidth - labelWidth - 2, 0);
    const valueStr = this._fitText(fonts.normal, size, String(value ?? ''), valueMaxWidth);
    if (valueStr) {
      page.drawText(valueStr, { x: valueX, y, size, font: fonts.normal, color: textRgb });
    }
  }

  /**
   * Formatea el valor de una celda del transcript. Las columnas de datos
   * numéricos/opcionales sin valor muestran el placeholder; el resto vacío.
   * @private
   */
  _formatCellValue(value, key) {
    const conPlaceholder = ['cargaHoraria', 'prerrequisitoSigla', 'notaFinal', 'notaRecuperacion'];
    if (value == null || value === '') {
      return conPlaceholder.includes(key) ? HISTORIAL_ACADEMICO_PDF_CONFIG.nullPlaceholder : '';
    }
    return String(value);
  }

  /**
   * Dibuja texto de una línea dentro de una celda con alineación y recorte.
   * @private
   */
  _drawCellText(font, size, value, col, cellBottomY, cellHeight, color, padding, align) {
    const maxWidth = col.width - padding * 2;
    const str = this._fitText(font, size, String(value ?? ''), maxWidth);
    if (!str) return;
    const textWidth = this._safeWidth(font, str, size);
    let x;
    if (align === 'center') {
      x = col.x + (col.width - textWidth) / 2;
    } else if (align === 'right') {
      x = col.x + col.width - textWidth - padding;
    } else {
      x = col.x + padding;
    }
    const y = cellBottomY + (cellHeight - size) / 2 + size * 0.3;
    this._currentPage.drawText(str, { x, y, size, font, color });
  }

  /**
   * Dibuja varias líneas (ya envueltas) centradas verticalmente en una celda.
   * @private
   */
  _drawCellLines(
    font,
    size,
    lines,
    col,
    cellBottomY,
    cellHeight,
    color,
    padding,
    align,
    lineHeight
  ) {
    const numLines = lines.length;
    const totalTextHeight = numLines * lineHeight;
    const startY = cellBottomY + (cellHeight - totalTextHeight) / 2 + size * 0.3;
    for (let i = 0; i < numLines; i += 1) {
      const str = lines[i];
      if (str) {
        const textWidth = this._safeWidth(font, str, size);
        let x;
        if (align === 'center') {
          x = col.x + (col.width - textWidth) / 2;
        } else if (align === 'right') {
          x = col.x + col.width - textWidth - padding;
        } else {
          x = col.x + padding;
        }
        const y = startY + (numLines - 1 - i) * lineHeight;
        this._currentPage.drawText(str, { x, y, size, font, color });
      }
    }
  }

  /**
   * Línea horizontal de borde de la tabla.
   * @private
   */
  _hLine(page, x, width, y, color, thickness) {
    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness,
      color
    });
  }

  /**
   * Recorta un texto con elipsis para que quepa en `maxWidth`.
   * @private
   */
  _fitText(font, size, value, maxWidth) {
    let str = String(value ?? '');
    if (!str) return '';
    if (this._safeWidth(font, str, size) <= maxWidth) return str;
    while (str.length > 1 && this._safeWidth(font, `${str}…`, size) > maxWidth) {
      str = str.slice(0, -1);
    }
    return `${str}…`;
  }

  /**
   * Ancho de texto tolerante a fuentes que no soportan ciertos glifos.
   * @private
   */
  _safeWidth(font, str, size) {
    try {
      return font.widthOfTextAtSize(str, size);
    } catch {
      return String(str).length * size * 0.5;
    }
  }
}

export default HistorialAcademicoPdfGenerator;
