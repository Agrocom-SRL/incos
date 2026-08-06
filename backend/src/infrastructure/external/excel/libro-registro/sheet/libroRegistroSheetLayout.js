/**
 * libroRegistroSheetLayout — aritmética PURA de columnas del bloque de folio
 * (sin composer ni estado). El número de materias es variable por paralelo:
 *
 *   A(N°) · B:C(NÓMINA) · D(C.I.) · una columna por materia ·
 *   ESTADO (2 cols fusionadas) · OBSERVACIONES (4 cols fusionadas)
 *
 * Espejo del libro real (7 materias → A..Q).
 */

/** Columnas fijas de identificación. */
export const COL_NRO = 1;
export const COL_NOMBRE_START = 2;
export const COL_NOMBRE_END = 3;
export const COL_CI = 4;

/**
 * Mapa de columnas para `n` asignaturas.
 * @param {Array<Object>} asignaturas
 * @returns {Object} índices 1-based + helpers.
 */
export function computeLibroColumnMap(asignaturas) {
  const n = Array.isArray(asignaturas) ? asignaturas.length : 0;
  const firstAsigCol = COL_CI + 1;
  const colEstadoStart = firstAsigCol + n;
  const colEstadoEnd = colEstadoStart + 1;
  const colObsStart = colEstadoEnd + 1;
  const colObsEnd = colObsStart + 3;

  return {
    COL_NRO,
    COL_NOMBRE_START,
    COL_NOMBRE_END,
    COL_CI,
    firstAsigCol,
    /** Columna de la asignatura i (0-based). */
    asigCol: (i) => firstAsigCol + i,
    COL_ESTADO_START: colEstadoStart,
    COL_ESTADO_END: colEstadoEnd,
    COL_OBS_START: colObsStart,
    COL_OBS_END: colObsEnd,
    lastCol: colObsEnd,
    /** La banda de título corre de D hasta antes del bloque LIBRO/FOLIO N°. */
    tituloStartCol: COL_CI,
    tituloEndCol: colObsEnd - 3,
    /** Bloque LIBRO N°/FOLIO N° (etiqueta 2 cols + valor 1 col) a la derecha. */
    libroLabelStart: colObsEnd - 2,
    libroLabelEnd: colObsEnd - 1,
    libroValueCol: colObsEnd,
  };
}

/**
 * Fracción de columna (unidades de ancla de ExcelJS: entero = columna
 * 0-based, decimal = fracción DE ESA columna) que corresponde a un ancho
 * físico acumulado `targetWidth` (mismas unidades que COL_WIDTHS) medido
 * desde el borde izquierdo de `startCol0` (0-based), recorriendo `widths` en
 * orden.
 *
 * Necesario porque ExcelJS reparte la parte fraccionaria de `col` sobre el
 * ancho de LA COLUMNA donde cae, no sobre un promedio del rango — con
 * columnas de ancho muy dispar (p. ej. A=5 vs C=34) una fracción uniforme
 * (`col + 0.15`) cae casi entera dentro de la primera columna y produce un
 * recuadro visiblemente descentrado. Ver `exceljs/lib/doc/anchor.js` (`Anchor#col`).
 *
 * @param {number} startCol0 - Columna inicial, 0-based.
 * @param {number[]} widths - Anchos (unidades Excel) de las columnas del rango, en orden.
 * @param {number} targetWidth - Ancho acumulado objetivo, mismas unidades que `widths`.
 * @returns {number} Columna fraccionaria para usar como `col` en `tl`/`br` de `addImage`.
 */
export function colFractionAtWidth(startCol0, widths, targetWidth) {
  let remaining = targetWidth;
  let col = startCol0;
  for (const width of widths) {
    if (remaining <= width) return col + remaining / width;
    remaining -= width;
    col += 1;
  }
  return col;
}

export default computeLibroColumnMap;
