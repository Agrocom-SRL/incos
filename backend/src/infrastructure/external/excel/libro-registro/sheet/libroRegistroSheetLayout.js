/**
 * libroRegistroSheetLayout — aritmética PURA de columnas del bloque de folio
 * (sin composer ni estado). El número de materias es variable por paralelo:
 *
 *   A(N°) · B:C(NÓMINA) · D(C.I.) · una columna por materia ·
 *   ESTADO (2 cols fusionadas) · OBSERVACIONES (3 cols fusionadas)
 *
 * Espejo del libro real (8 materias → A..Q). Los bloques de la cabecera
 * derecha (LIBRO/FOLIO, TURNO, R.M., CARÁCTER) y las zonas de firma se
 * posicionan RELATIVOS A LA ÚLTIMA COLUMNA, así conservan su lugar en la hoja
 * aunque cambie la cantidad de materias.
 */

/** Columnas fijas de identificación. */
export const COL_NRO = 1;
export const COL_NOMBRE_START = 2;
export const COL_NOMBRE_END = 3;
export const COL_CI = 4;

/** Columnas de ESTADO y OBSERVACIONES (fusionadas), como en el físico. */
const COLS_ESTADO = 2;
const COLS_OBS = 3;

/**
 * Mapa de columnas para `n` asignaturas.
 * @param {Array<Object>} asignaturas
 * @returns {Object} índices 1-based + helpers.
 */
export function computeLibroColumnMap(asignaturas) {
  const n = Array.isArray(asignaturas) ? asignaturas.length : 0;
  const firstAsigCol = COL_CI + 1;
  const colEstadoStart = firstAsigCol + n;
  const colEstadoEnd = colEstadoStart + COLS_ESTADO - 1;
  const colObsStart = colEstadoEnd + 1;
  const colObsEnd = colObsStart + COLS_OBS - 1;
  const lastCol = colObsEnd;
  // Resguardo para paralelos con muy pocas materias (fuera del rango real de
  // INCOS): ningún bloque relativo a la derecha puede caer antes de C.
  const desdeDerecha = (offset) => Math.max(COL_NOMBRE_END, lastCol - offset);

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
    lastCol,
    /** Título: de D hasta la última columna de ESTADO (D4:N5 en el físico). */
    tituloStartCol: COL_CI,
    tituloEndCol: colEstadoEnd,
    /** Cuadro LIBRO N°/FOLIO N° sobre las columnas de OBSERVACIONES: rótulo 2 cols + valor 1 col. */
    libroLabelStart: colObsStart,
    libroLabelEnd: colObsStart + 1,
    libroValueCol: colObsEnd,
    /** Fila 7/8 derecha: TURNO:/CARÁCTER: (L:M) y sus valores (N:O) en el físico. */
    turnoLabel: [desdeDerecha(5), desdeDerecha(4)],
    turnoValue: [desdeDerecha(3), desdeDerecha(2)],
    /** Fila 8: valor de INSTITUCIÓN (C:H), R.M. (I) y su valor (J:K) en el físico. */
    institucionValue: [COL_NOMBRE_END, desdeDerecha(9)],
    rmLabelCol: desdeDerecha(8),
    rmValue: [desdeDerecha(7), desdeDerecha(6)],
    /** La línea bajo INSTITUCIÓN…R.M. llega hasta el valor del R.M. (A:K). */
    institucionLineaEnd: desdeDerecha(6),
  };
}

/**
 * Reexportado desde el toolkit compartido (`shared/ExcelSheetComposer.js`):
 * la misma utilidad de centrado de imagen la usa `titulacion-seguimiento-docentes`.
 */
export { colFractionAtWidth } from '../../shared/index.js';

/**
 * 3 zonas horizontales [colInicio, colFin] (1-based) de las FIRMAS DE
 * AUTORIDADES al pie del folio: JEFE(A) DE CARRERA (C) / DIRECTOR(A)
 * ACADÉMICO(A) (E:H) / RECTOR(A) (L:O) en el físico — las dos últimas
 * relativas a la derecha.
 *
 * @param {ReturnType<typeof computeLibroColumnMap>} layout
 * @returns {[number, number][]} 3 pares [colInicio, colFin].
 */
export function computeTresZonasFirmas(layout) {
  const { lastCol, firstAsigCol } = layout;
  const clamp = (col) => Math.min(Math.max(col, COL_NOMBRE_END), lastCol);
  return [
    [COL_NOMBRE_END, COL_NOMBRE_END],
    [clamp(firstAsigCol), clamp(firstAsigCol + 3)],
    [clamp(lastCol - 5), clamp(lastCol - 2)],
  ];
}

/**
 * 3 zonas [colInicio, colFin] de la grilla de FIRMAS DE DOCENTES (página
 * final). El físico usa C:D / E:J / L:Q (8 materias), con la 1ra y 2da zona
 * CONTIGUAS; desde que cada nombre lleva una línea de firma encima
 * (`LINEA_FIRMA`, 2026-08-21) las zonas dejan UNA columna de aire
 * entre sí — si no, las líneas de dos docentes vecinos se funden en una sola
 * raya. Resultado con 8 materias: C:D / F:K / M:Q (aire en E y L); la 2da y
 * 3ra siguen relativas a la derecha: la 3ra es siempre ESTADO + OBSERVACIONES
 * (5 columnas) y la 2da va desde la 2da columna de materia hasta la
 * antepenúltima materia (tan ancha como antes, corrida una columna).
 *
 * @param {ReturnType<typeof computeLibroColumnMap>} layout
 * @returns {[number, number][]} 3 pares [colInicio, colFin].
 */
export function computeTresZonasDocentes(layout) {
  const { lastCol, firstAsigCol } = layout;
  const clamp = (col) => Math.min(Math.max(col, COL_NOMBRE_END), lastCol);
  return [
    [COL_NOMBRE_END, COL_CI],
    [clamp(firstAsigCol + 1), clamp(lastCol - 6)],
    [clamp(lastCol - 4), lastCol],
  ];
}

/**
 * Columnas del bloque ESTADÍSTICAS (D107:J113 en el físico): DETALLE (D:H),
 * CANTIDAD (I), % (J) — independientes del número de materias.
 * @returns {{ detalle: [number, number], cantidad: number, porcentaje: number }}
 */
export function computeColumnasEstadisticas() {
  return {
    detalle: [COL_CI, COL_CI + 4],
    cantidad: COL_CI + 5,
    porcentaje: COL_CI + 6,
  };
}

export default computeLibroColumnMap;
