/**
 * ExcelSheetComposer — primitivas estandarizadas para componer hojas Excel.
 *
 * Envuelve una worksheet de ExcelJS y ofrece operaciones reutilizables (celdas
 * con estilo, merges, banda de título institucional, cabeceras etiqueta/valor,
 * bordes de fila, panes congelados) tomando todos los tokens de ExcelTheme.
 *
 * Objetivo: que cada *ExcelBuilder* describa QUÉ va en la hoja y no CÓMO se
 * pinta cada celda, evitando helpers ad-hoc duplicados y manteniendo un diseño
 * homogéneo entre reportes.
 */

import { EXCEL_FONT, EXCEL_FONT_SIZE, EXCEL_COLOR, EXCEL_BORDER } from './ExcelTheme.js';

/** Convierte índice de columna 1-based a letra ('A', 'B', ... 'AA'). */
export const colLetter = (col) => {
  let n = col;
  let s = '';
  while (n > 0) {
    const mod = (n - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    n = Math.floor((n - mod) / 26);
  }
  return s;
};

/**
 * Fracción de columna (unidades de ancla de ExcelJS: entero = columna
 * 0-based, decimal = fracción DE ESA columna) que corresponde a un ancho
 * físico acumulado `targetWidth` (mismas unidades que los anchos de columna)
 * medido desde el borde izquierdo de `startCol0` (0-based), recorriendo
 * `widths` en orden.
 *
 * Necesario porque ExcelJS reparte la parte fraccionaria de `col` sobre el
 * ancho de LA COLUMNA donde cae, no sobre un promedio del rango — con
 * columnas de ancho muy dispar (p. ej. una columna N° angosta junto a una
 * columna de texto ancha) una fracción uniforme (`col + 0.15`) cae casi
 * entera dentro de la primera columna y produce una imagen visiblemente
 * descentrada. Ver `exceljs/lib/doc/anchor.js` (`Anchor#col`). Compartido
 * entre generadores que centran un logo/imagen dentro de un bloque de
 * columnas (p. ej. `libro-registro`, `titulacion-seguimiento-docentes`).
 *
 * @param {number} startCol0 - Columna inicial, 0-based.
 * @param {number[]} widths - Anchos (unidades Excel) de las columnas del rango, en orden.
 * @param {number} targetWidth - Ancho acumulado objetivo, mismas unidades que `widths`.
 * @returns {number} Columna fraccionaria para usar como `col` en `tl`/`br` de `addImage`.
 */
export const colFractionAtWidth = (startCol0, widths, targetWidth) => {
  let remaining = targetWidth;
  let col = startCol0;
  for (const width of widths) {
    if (remaining <= width) return col + remaining / width;
    remaining -= width;
    col += 1;
  }
  return col;
};

const borderAll = (style) => ({ top: style, left: style, bottom: style, right: style });

export class ExcelSheetComposer {
  /** @param {import('exceljs').Worksheet} worksheet */
  constructor(worksheet) {
    this.ws = worksheet;
  }

  /**
   * Aplica un descriptor de estilo a una celda.
   * @param {import('exceljs').Cell} cell
   * @param {Object} [s]
   * @param {number} [s.size] tamaño de fuente
   * @param {boolean} [s.bold]
   * @param {string} [s.fontColor] ARGB del texto
   * @param {string} [s.fill] ARGB de relleno
   * @param {'left'|'center'|'right'} [s.align]
   * @param {boolean} [s.wrap]
   * @param {boolean} [s.border] pinta borde (default true)
   * @param {boolean} [s.borderMedium] usa borde medium en vez de thin
   * @param {string} [s.borderColor] ARGB del borde (default: color del theme)
   * @param {'top'|'middle'|'bottom'} [s.valign] alineación vertical (default middle)
   * @param {number} [s.rotation] rotación del texto en grados (0-180 o 255 para vertical apilado)
   */
  style(cell, s = {}) {
    cell.font = {
      name: EXCEL_FONT,
      size: s.size ?? EXCEL_FONT_SIZE.body,
      bold: Boolean(s.bold),
      color: { argb: s.fontColor ?? EXCEL_COLOR.ink }
    };
    if (s.fill) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.fill } };
    }
    cell.alignment = {
      horizontal: s.align ?? 'center',
      vertical: s.valign ?? 'middle',
      wrapText: Boolean(s.wrap),
      indent: s.indent ?? (s.align === 'left' ? 1 : 0),
      textRotation: s.rotation ?? 0
    };
    if (s.border !== false) {
      const base = s.borderMedium ? EXCEL_BORDER.medium : EXCEL_BORDER.thin;
      cell.border = borderAll(s.borderColor ? { ...base, color: { argb: s.borderColor } } : base);
    }
    return cell;
  }

  /** Escribe valor + estilo en una celda (por fila/col o por dirección 'A1'). */
  cell(rowOrAddr, colOrValue, valueOrStyle, maybeStyle) {
    let cell;
    let value;
    let style;
    if (typeof rowOrAddr === 'string') {
      cell = this.ws.getCell(rowOrAddr);
      value = colOrValue;
      style = valueOrStyle;
    } else {
      cell = this.ws.getCell(rowOrAddr, colOrValue);
      value = valueOrStyle;
      style = maybeStyle;
    }
    if (value !== undefined) cell.value = value;
    this.style(cell, style);
    return cell;
  }

  /** Escribe una fórmula (string ExcelJS) con estilo. */
  formula(row, col, formula, style) {
    const cell = this.ws.getCell(row, col);
    cell.value = { formula };
    this.style(cell, style);
    return cell;
  }

  /** Fusiona un rango y aplica valor + estilo a la celda ancla (rango de una celda: sin merge). */
  merge(range, value, style) {
    const [start, end] = range.split(':');
    if (end && end !== start) this.ws.mergeCells(range);
    return this.cell(start, value, style);
  }

  /**
   * Fusiona un rango por ÍNDICES (r1,c1) → (r2,c2) y aplica valor + estilo en la
   * celda ancla, reutilizando el mismo motor de estilo que `merge(range, ...)`.
   * Evita que los builders perforen la abstracción con `ws.mergeCells(...)`
   * directo cuando ya conocen las coordenadas numéricas (cabeceras verticales,
   * bloques que cubren varias filas). Rango de una sola celda: no fusiona.
   */
  mergeBox(r1, c1, r2, c2, value, style) {
    if (r1 !== r2 || c1 !== c2) this.ws.mergeCells(r1, c1, r2, c2);
    return this.cell(r1, c1, value, style);
  }

  /** Define el alto (puntos) de una fila por índice 1-based. */
  rowHeight(rowNumber, height) {
    this.ws.getRow(rowNumber).height = height;
    return this;
  }

  /** Banda de título institucional (fondo sólido, texto claro). */
  bandTitle(range, text) {
    return this.merge(range, text, {
      size: EXCEL_FONT_SIZE.title,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.band,
      borderMedium: true
    });
  }

  /** Par etiqueta (negrita) + valor en celdas dadas. */
  labelValue(labelAddr, label, valueAddr, value) {
    this.cell(labelAddr, label, { bold: true, align: 'left' });
    this.cell(valueAddr, value ?? '', { align: 'left', fontColor: EXCEL_COLOR.inkSoft });
  }

  /**
   * Campo de cabecera institucional: etiqueta en negrita con fondo + valor.
   * Ambos parámetros son rangos ('B2:C2'); se fusionan para alinear el bloque.
   */
  infoField(labelRange, label, valueRange, value) {
    this.merge(labelRange, label, { bold: true, align: 'left', fill: EXCEL_COLOR.infoLabel });
    this.merge(valueRange, value ?? '', { align: 'left', fontColor: EXCEL_COLOR.inkSoft });
  }

  /** Define anchos por índice de columna: { 2: 5, 3: 35, ... }. */
  colWidths(widths) {
    Object.entries(widths).forEach(([col, width]) => {
      this.ws.getColumn(Number(col)).width = width;
    });
  }

  /** Pinta un borde homogéneo en un rango horizontal de una fila. */
  borderRow(row, colStart, colEnd, { medium = false } = {}) {
    const style = medium ? EXCEL_BORDER.medium : EXCEL_BORDER.thin;
    for (let c = colStart; c <= colEnd; c += 1) {
      this.ws.getCell(row, c).border = borderAll(style);
    }
  }

  /**
   * Contorno de un rango (r1,c1)→(r2,c2): pinta SOLO los lados exteriores
   * pedidos (arriba en la primera fila, abajo en la última, izquierda en la
   * primera columna, derecha en la última), conservando los bordes que cada
   * celda ya tenga. Sirve para cajas con borde exterior distinto al interior
   * (p. ej. un cuadro LIBRO/FOLIO con contorno medio y divisor fino), líneas
   * horizontales de separación y líneas de firma (`style: 'dotted'`).
   *
   * @param {number} r1
   * @param {number} c1
   * @param {number} r2
   * @param {number} c2
   * @param {Object} [opts]
   * @param {'thin'|'medium'|'dotted'|'hair'} [opts.style='thin']
   * @param {string} [opts.color] ARGB (default: color de borde del theme)
   * @param {{top?:boolean,bottom?:boolean,left?:boolean,right?:boolean}} [opts.sides]
   *        lados a pintar (default: los cuatro)
   */
  outline(r1, c1, r2, c2, { style = 'thin', color, sides } = {}) {
    const side = { style, color: { argb: color ?? EXCEL_BORDER.thin.color.argb } };
    const want = { top: true, bottom: true, left: true, right: true, ...(sides ?? {}) };
    for (let r = r1; r <= r2; r += 1) {
      for (let c = c1; c <= c2; c += 1) {
        const cell = this.ws.getCell(r, c);
        const border = { ...(cell.border ?? {}) };
        if (want.top && r === r1) border.top = side;
        if (want.bottom && r === r2) border.bottom = side;
        if (want.left && c === c1) border.left = side;
        if (want.right && c === c2) border.right = side;
        cell.border = border;
      }
    }
    return this;
  }

  /** Congela las primeras `rows` filas y `cols` columnas. */
  freeze(rows, cols = 0) {
    this.ws.views = [{ state: 'frozen', xSplit: cols, ySplit: rows }];
  }
}

export default ExcelSheetComposer;
