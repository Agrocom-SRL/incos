/**
 * BoletinPdfGenerator
 *
 * Servicio de infraestructura que genera el BOLETÍN DE CALIFICACIONES de UN
 * estudiante en PDF (tamaño carta, vertical) SOBRE la plantilla institucional
 * `Plantilla.pdf` —el mismo soporte que Formulario de Inscripción / Declaración
 * Jurada / Acta de Compromiso—. La plantilla aporta el encabezado con los logos
 * institucionales y el pie de página verde; este generador sólo dibuja el
 * contenido (título, datos, tabla, firmas) debajo del encabezado.
 *
 * Implementa IBoletinPdfGenerator y extiende IncosPDFLibBase para reutilizar la
 * carga de la plantilla, las fuentes personalizadas, `_hexToRgb` y el estado de
 * documento. La tabla de notas se dibuja a mano (no con `_addTable`) para lograr
 * el agrupado/tinte de las columnas de resumen (PROM/HAB/FINAL) y la fila de pie
 * "Promedio Anual".
 *
 * El MISMO generador arma los dos tipos de boletín:
 * - ANUAL: columnas de los 4 parciales + PROM/HAB/FINAL + OBSERVACIONES (estado
 *   por asignatura según la escala vigente).
 * - BIMESTRAL (payload con `bimestre` 1..4): desglose del bimestre por
 *   asignatura — TEÓRICA + PRÁCTICA = TOTAL — y columna ESTADO; la cabecera
 *   añade la fila BIMESTRE y el pie usa `footerRowLabel` del payload.
 * En ambos, si el payload trae `observaciones` (texto del bimestre a nivel
 * estudiante) se listan debajo de la tabla, antes de las firmas.
 *
 * Principios SOLID:
 * - Single Responsibility: solo arma el boletín; los datos llegan ya formados.
 * - Open/Closed: extiende IncosPDFLibBase sin modificarla.
 * - Métodos privados por sección (título, datos, tabla, firmas).
 *
 * @module BoletinPdfGenerator
 */

import { StandardFonts } from 'pdf-lib';
import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { BOLETIN_PDF_CONFIG } from './boletinPdfConfig.js';
import { computeColumnGeometry } from './boletinPdfLayout.js';

export class BoletinPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * Genera el PDF del boletín de un estudiante.
   * @param {Object} datos - Payload formado por `construirDatosBoletinEstudiante`.
   * @returns {Promise<Buffer>}
   */
  async generarBoletinEstudiante(datos) {
    // La plantilla institucional aporta el encabezado (logos) y el pie de página
    // verde; _loadTemplate además registra fontkit para embeber la fuente britannic.
    const pdfDoc = await this._loadTemplate('Plantilla.pdf');
    const page = pdfDoc.getPages()[0];
    // useInitialY=true → el contenido arranca debajo del encabezado de la plantilla.
    this._initializeDocumentState(pdfDoc, page, true);

    const fonts = {
      title: await this._loadCustomFont(pdfDoc, IncosPDFBase.FONTS.defaultTitleFont),
      normal: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    };

    this._titulo(page, fonts, datos);
    this._datosEstudiante(page, fonts, datos);
    this._tablaNotas(page, fonts, datos);
    this._observaciones(page, fonts, datos);
    this._firmas(page, fonts);

    const buffer = await this._saveDocument(pdfDoc);

    if (this.logger) {
      this.logger.info('[BoletinPdfGenerator] Boletín generado (buffer)', {
        size: buffer.length,
        asignaturas: Array.isArray(datos?.filas) ? datos.filas.length : 0
      });
    }

    return buffer;
  }

  // ============================================
  // SECCIONES
  // ============================================

  /**
   * Título "BOLETIN DE CALIFICACIONES" (fuente britannic, centrado, color primario).
   * @private
   */
  _titulo(page, fonts, datos) {
    const { width: pageWidth } = page.getSize();
    const cfg = BOLETIN_PDF_CONFIG;
    const title = datos?.titulo || 'BOLETIN DE CALIFICACIONES';
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
   * Bloque de datos del estudiante en dos columnas (label:value).
   * @private
   */
  _datosEstudiante(page, fonts, datos) {
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = BOLETIN_PDF_CONFIG;
    const cabecera = datos?.cabecera ?? {};
    const contentWidth = pageWidth - margins.left - margins.right;
    const leftX = margins.left;
    const rightX = margins.left + contentWidth * 0.55;
    const colMaxWidth = contentWidth * 0.45;
    const size = cfg.fonts.datosSize;
    const lineGap = 16;

    this._drawLabelValue(
      page,
      fonts,
      leftX,
      this._currentY,
      'ESTUDIANTE: ',
      cabecera.estudiante ?? '',
      contentWidth,
      size
    );
    this._currentY -= lineGap;

    const rows = [
      ['CARRERA: ', cabecera.carrera ?? '', 'NIVEL: ', cabecera.nivel ?? ''],
      ['CURSO: ', cabecera.curso ?? '', 'PARALELO: ', cabecera.paralelo ?? ''],
      ['RÉGIMEN: ', cabecera.regimen ?? '', 'GESTIÓN: ', String(cabecera.gestion ?? '')]
    ];

    // Boletín bimestral: fila extra que indica el bimestre exportado.
    if (cabecera.bimestre) {
      rows.push(['BIMESTRE: ', String(cabecera.bimestre), '', '']);
    }

    for (const [leftLabel, leftValue, rightLabel, rightValue] of rows) {
      this._drawLabelValue(
        page,
        fonts,
        leftX,
        this._currentY,
        leftLabel,
        leftValue,
        colMaxWidth,
        size
      );
      if (rightLabel) {
        this._drawLabelValue(
          page,
          fonts,
          rightX,
          this._currentY,
          rightLabel,
          rightValue,
          colMaxWidth,
          size
        );
      }
      this._currentY -= lineGap;
    }

    this._currentY -= 8;
  }

  /**
   * Tabla de notas dibujada a mano: cabecera verde con texto blanco, columnas de
   * resumen con leve fondo gris, y fila de pie "Promedio Anual" con los promedios
   * de clase por parcial. Bordes completos al final.
   * @private
   */
  _tablaNotas(page, fonts, datos) {
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = BOLETIN_PDF_CONFIG;
    const contentWidth = pageWidth - margins.left - margins.right;
    const cols = computeColumnGeometry({
      columns: this._columnasVisibles(datos),
      contentWidth,
      startX: margins.left
    });

    const primary = this._hexToRgb(cfg.colors.primary);
    const headerText = this._hexToRgb(cfg.colors.headerText);
    const text = this._hexToRgb(cfg.colors.text);
    const border = this._hexToRgb(cfg.colors.border);
    const tint = this._hexToRgb(cfg.colors.tint);

    const { headerHeight, rowHeight, cellPadding, borderWidth } = cfg.table;
    const filas = Array.isArray(datos?.filas) ? datos.filas : [];

    const topY = this._currentY;
    const headerBottomY = topY - headerHeight;

    // Cabecera (fondo verde + texto blanco centrado)
    page.drawRectangle({
      x: margins.left,
      y: headerBottomY,
      width: contentWidth,
      height: headerHeight,
      color: primary
    });
    for (const col of cols) {
      this._drawCellText(
        page,
        fonts.bold,
        cfg.fonts.headerSize,
        col.label,
        col,
        headerBottomY,
        headerHeight,
        headerText,
        cellPadding,
        'center'
      );
    }

    // Filas de datos
    let rowTopY = headerBottomY;
    for (const fila of filas) {
      const rowBottomY = rowTopY - rowHeight;
      for (const col of cols) {
        if (col.tinted) {
          page.drawRectangle({
            x: col.x,
            y: rowBottomY,
            width: col.width,
            height: rowHeight,
            color: tint
          });
        }
      }
      for (const col of cols) {
        const value = this._formatCellValue(fila[col.key], col.key);
        if (value !== '') {
          this._drawCellText(
            page,
            fonts.normal,
            cfg.fonts.cellSize,
            value,
            col,
            rowBottomY,
            rowHeight,
            text,
            cellPadding,
            col.align
          );
        }
      }
      rowTopY = rowBottomY;
    }

    // Fila de pie: promedios de clase (por parcial en el anual; del bimestre,
    // bajo TOTAL, en el bimestral — las claves calzan con las columnas).
    const footerBottomY = rowTopY - rowHeight;
    page.drawRectangle({
      x: margins.left,
      y: footerBottomY,
      width: contentWidth,
      height: rowHeight,
      color: tint
    });
    const promedios = datos?.promedioClasePorParcial ?? {};
    for (const col of cols) {
      let value = '';
      let { align } = col;
      if (col.key === 'asignatura') {
        value = datos?.footerRowLabel || cfg.footerRowLabel;
        align = 'left';
      } else if (Object.prototype.hasOwnProperty.call(promedios, col.key)) {
        value = this._formatCellValue(promedios[col.key], col.key);
      }
      if (value !== '') {
        this._drawCellText(
          page,
          fonts.bold,
          cfg.fonts.footerSize,
          value,
          col,
          footerBottomY,
          rowHeight,
          text,
          cellPadding,
          align
        );
      }
    }

    // Bordes: marco exterior, líneas horizontales y verticales
    const tableBottomY = footerBottomY;
    const totalRows = filas.length + 1; // + fila de pie
    this._hLine(page, margins.left, contentWidth, topY, border, borderWidth); // tope
    let lineY = headerBottomY;
    this._hLine(page, margins.left, contentWidth, lineY, border, borderWidth); // base cabecera
    for (let i = 0; i < totalRows; i += 1) {
      lineY -= rowHeight;
      this._hLine(page, margins.left, contentWidth, lineY, border, borderWidth);
    }
    for (const col of cols) {
      page.drawLine({
        start: { x: col.x, y: topY },
        end: { x: col.x, y: tableBottomY },
        thickness: borderWidth,
        color: border
      });
    }
    page.drawLine({
      start: { x: margins.left + contentWidth, y: topY },
      end: { x: margins.left + contentWidth, y: tableBottomY },
      thickness: borderWidth,
      color: border
    });

    this._currentY = tableBottomY - 16;
  }

  /**
   * Dos bloques de firma al pie: DIRECTORA ACADÉMICA y RECTOR, con línea de firma.
   * @private
   */
  _firmas(page, fonts) {
    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = BOLETIN_PDF_CONFIG;
    const text = this._hexToRgb(cfg.colors.text);
    const border = this._hexToRgb(cfg.colors.border);
    const contentWidth = pageWidth - margins.left - margins.right;
    const lineWidth = 160;
    // Las firmas se anclan cerca del pie (como en el boletín físico): se bajan al
    // ancla baja cuando la tabla es corta, pero si la tabla es larga fluyen debajo
    // de ella. En ambos casos se mantienen POR ENCIMA del pie verde de la plantilla.
    const anclaBaja = margins.bottom + 150;
    const pisoSobrePie = margins.bottom + 90;
    const y = Math.max(Math.min(this._currentY - 36, anclaBaja), pisoSobrePie);

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
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Columnas efectivas de la tabla según el tipo de boletín: las del ANUAL
   * (`columns`) o, cuando el payload trae `bimestre` (1..4), el set BIMESTRAL
   * (`columnsBimestre`: TEÓRICA + PRÁCTICA = TOTAL + ESTADO). Ambos sets viven
   * en la configuración declarativa (`boletinPdfConfig.js`).
   * @private
   */
  _columnasVisibles(datos) {
    const bim = Number(datos?.bimestre);
    if (Number.isInteger(bim) && bim >= 1 && bim <= 4) {
      return BOLETIN_PDF_CONFIG.columnsBimestre;
    }
    return BOLETIN_PDF_CONFIG.columns;
  }

  /**
   * Bloque de observaciones del estudiante (texto del bimestre, a nivel
   * estudiante) debajo de la tabla: etiqueta en negrita + una línea por
   * observación, recortadas al ancho de contenido. Solo si el payload trae
   * `observaciones` con contenido.
   * @private
   */
  _observaciones(page, fonts, datos) {
    const lineas = Array.isArray(datos?.observaciones)
      ? datos.observaciones.filter((l) => String(l ?? '').trim() !== '')
      : [];
    if (lineas.length === 0) return;

    const { width: pageWidth } = page.getSize();
    const { margins } = IncosPDFBase.LAYOUT;
    const cfg = BOLETIN_PDF_CONFIG;
    const text = this._hexToRgb(cfg.colors.text);
    const contentWidth = pageWidth - margins.left - margins.right;
    const size = cfg.fonts.datosSize;
    const lineGap = 14;

    page.drawText('OBSERVACIONES:', {
      x: margins.left,
      y: this._currentY,
      size,
      font: fonts.bold,
      color: text
    });
    this._currentY -= lineGap;

    for (const linea of lineas) {
      const str = this._fitText(fonts.normal, size, String(linea), contentWidth);
      page.drawText(str, {
        x: margins.left,
        y: this._currentY,
        size,
        font: fonts.normal,
        color: text
      });
      this._currentY -= lineGap;
    }

    this._currentY -= 4;
  }

  /**
   * Dibuja "label" (bold) + "value" (normal) en la misma línea, recortando el valor
   * al ancho disponible. No usa fuentes async: recibe las ya embebidas.
   * @private
   */
  _drawLabelValue(page, fonts, x, y, label, value, maxWidth, size) {
    const textRgb = this._hexToRgb(BOLETIN_PDF_CONFIG.colors.text);
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
   * Formatea el valor de una celda. Las columnas numéricas sin nota muestran el
   * placeholder; HAB., OBSERVACIONES y ESTADO vacías quedan en blanco.
   * @private
   */
  _formatCellValue(value, key) {
    if (key === 'hab' || key === 'obs' || key === 'estado') {
      return value == null ? '' : String(value);
    }
    if (value == null || value === '') {
      return BOLETIN_PDF_CONFIG.nullPlaceholder;
    }
    return String(value);
  }

  /**
   * Dibuja texto dentro de una celda con alineación y recorte al ancho de columna.
   * @private
   */
  _drawCellText(page, font, size, value, col, cellBottomY, cellHeight, color, padding, align) {
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
    page.drawText(str, { x, y, size, font, color });
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

export default BoletinPdfGenerator;
