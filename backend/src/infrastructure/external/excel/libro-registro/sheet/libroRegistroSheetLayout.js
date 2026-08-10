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
 * Reexportado desde el toolkit compartido (`shared/ExcelSheetComposer.js`):
 * la misma utilidad de centrado de imagen la usa `titulacion-seguimiento-docentes`.
 */
export { colFractionAtWidth } from '../../shared/index.js';

/**
 * 3 zonas horizontales [colInicio, colFin] (1-based) para bloques de 3
 * firmas: JEFE(A) DE CARRERA / DIRECTOR(A) ACADÉMICO(A) / RECTOR(A) en
 * `_firmasAutoridades` y la grilla de 3 columnas de `_firmasDocentes`.
 *
 * Columnas fijas (C:E / G:J / L:Q), con aire entre ellas — no relativas al n°
 * de materias: se recortan a `lastCol` solo como resguardo para paralelos con
 * muy pocas materias (fuera del rango real de INCOS).
 *
 * @param {ReturnType<typeof computeLibroColumnMap>} layout
 * @returns {[number, number][]} 3 pares [colInicio, colFin].
 */
export function computeTresZonasFirmas(layout) {
  const clamp = (col) => Math.min(col, layout.lastCol);
  return [
    [clamp(3), clamp(5)], // C:E
    [clamp(7), clamp(10)], // G:J
    [clamp(12), clamp(17)], // L:Q
  ];
}

export default computeLibroColumnMap;
