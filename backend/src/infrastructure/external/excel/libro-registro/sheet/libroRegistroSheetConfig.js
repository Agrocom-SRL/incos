/**
 * libroRegistroSheetConfig — configuración declarativa de la hoja del Libro de
 * registro (un paralelo; folios apilados verticalmente, réplica del libro
 * físico "LIBRO LLENADO SISTEMAS 11 dic 2025": bloques de 34 filas).
 *
 * TODOS los valores (anchos, altos, tamaños de fuente, colores, anclaje del
 * logo) están MEDIDOS sobre el archivo físico real (hoja "3RO A SIST", folio
 * de las filas 1-34 y página de firmas de docentes de las filas 69-118) — no
 * son estimaciones. El documento es un formulario oficial del Ministerio de
 * Educación: debe verse EXACTAMENTE igual al papel. Colores desde ExcelTheme
 * (sin hex sueltos).
 */

import { EXCEL_COLOR } from '../../shared/index.js';

/** Alto del bloque de un folio (filas), como en el libro real (folio 56 = filas 1-34). */
export const FILAS_POR_FOLIO = 34;

/**
 * Filas por celda de la grilla de FIRMAS DE DOCENTES (página final de la
 * hoja): 6 filas de espacio en blanco (firma física, sin línea, ≈100pt) +
 * 1 fila de nombre del docente + 1 fila de materia. El físico usa 11 (con
 * alturas de fila retocadas a mano para que entre en la hoja); con 8 el
 * bloque de 3 grupos + ESTADÍSTICAS cabe en UNA página oficio horizontal sin
 * retoques.
 */
export const FILAS_POR_FIRMA = 8;

/** Columnas de la grilla de FIRMAS DE DOCENTES (3 firmas por fila, como el papel real). */
export const COLUMNAS_FIRMAS_DOCENTES = 3;

/**
 * Anchos de columna (unidades Excel) por rol semántico, 1:1 con el libro
 * físico: A=4.29, B=9.43, C=39.43, D=14.71, materias 7.71-9.43 (se usa un
 * ancho uniforme), ESTADO = 8.71 + 6.86, OBSERVACIONES = 7.71 + 7.71 + 19.86.
 * Ancho total con 8 materias ≈ 190 unidades, lo que cabe en una hoja oficio
 * horizontal ajustada a 1 página de ancho.
 *
 * OJO ExcelJS: un ancho de EXACTAMENTE `9` no se serializa como `customWidth`
 * (coincide con el default interno de la librería) y la columna vuelve al
 * ancho por defecto de Excel (~8.43) — nunca usar `9` aquí.
 */
export const COL_WIDTHS = {
  nro: 4.29, // A — N°
  nombreIzq: 9.43, // B — 1ra columna de NÓMINA (par B:C)
  nombreDer: 39.43, // C — 2da columna de NÓMINA (valores de cabecera también van en C)
  ci: 14.71, // D — CÉDULA DE IDENTIDAD
  asignatura: 8.86, // una columna por materia
  estado: [8.71, 6.86], // las 2 columnas de ESTADO
  obs: [7.71, 7.71, 19.86], // las 3 columnas de OBSERVACIONES
};

/**
 * Tamaños de fuente (pt) medidos en el físico. Locales a este documento: los
 * tamaños institucionales de `EXCEL_FONT_SIZE` (14-20pt) son para los
 * reportes internos del sistema, no para este formulario oficial.
 */
export const FONT_SIZE = {
  titulo: 20, // CENTRALIZADOR DE CALIFICACIONES (folio)
  tituloDocentes: 24, // mismo título en la página de firmas de docentes
  codigoRegistro: 11,
  libroFolio: 14, // LIBRO N° / FOLIO N° y sus valores
  ciudad: 10, // Santa Cruz - Bolivia
  campo: 11, // etiquetas y valores de cabecera, TURNO/R.M./CARÁCTER, siglas, N°/NÓMINA
  cabeceraTabla: 12, // CÉDULA DE IDENTIDAD, nombres de materia, ESTADO, OBSERVACIONES
  numeroOrden: 10, // N° de fila (negrita)
  dato: 12, // nombre, C.I., notas, ESTADO
  observacion: 9,
  leyenda: 9, // NP / AP / PRE
  firma: 9, // rótulos de firma de autoridades
  docente: 11, // nombre y materia en la página de firmas de docentes
  estadisticasTitulo: 14,
  estadisticasCabecera: 9,
  estadisticasEtiqueta: 10,
  estadisticasValor: 11,
  notaBorrador: 9,
};

/**
 * Alturas de fila (puntos) medidas en el físico. Toda la cabecera usa el alto
 * `base` (16.5pt) salvo: la fila superior del bloque (Código de Registro,
 * 42.75pt: margen superior del folio), la fila CARRERA (49.5pt: es la que
 * estira la fusión vertical de los nombres de materia rotados) y la fila
 * N°/NÓMINA DE ESTUDIANTES (28.5pt). Las filas de estudiante son `base` y
 * se estiran a `dataRowDosLineas` solo cuando la observación envuelve a 2
 * líneas (en el físico eso se hizo a mano, fila por fila).
 */
export const ROW_HEIGHTS = {
  superior: 42.75, // fila 1 del bloque (Código de Registro)
  base: 16.5,
  carrera: 49.5,
  nomina: 28.5,
  dataRow: 16.5,
  dataRowDosLineas: 24, // fila de estudiante con observación de 2 líneas
  leyenda: 12, // las 3 líneas NP/AP/PRE van juntas (en el físico es un cuadro de texto compacto)
  estadisticasFila: 21.75,
};

/**
 * Caracteres por línea que caben en OBSERVACIONES (3 columnas ≈ 35 unidades)
 * a 9pt: por encima, la observación envuelve a una 2da línea y la fila se
 * estira a `dataRowDosLineas`.
 */
export const OBS_CHARS_POR_LINEA = 48;

/**
 * Offsets de fila DENTRO del bloque de un folio (1-based, relativos al inicio
 * del bloque). Espejo del libro real: Código de Registro (1, sobre las
 * columnas de OBSERVACIONES), escudo/logo (2-6, columnas A:C), título (4-5),
 * cuadro LIBRO/FOLIO (3-6 con sus rótulos en 4-5), ciudad/turno (7),
 * institución/R.M./carácter (8), gestión+siglas (9), nivel+nombres de materia
 * (10-14 fusionados), carrera (11), régimen (12), curso (13), cabecera de
 * nómina (14), estudiantes (15-24), leyenda NP/AP/PRE (26-28), firmas de
 * autoridades (32; con el libro ABIERTO ese renglón lleva en su lugar la
 * nota de borrador).
 */
export const FILA = {
  codigoRegistro: 1,
  logoInicio: 2,
  logoFin: 6,
  libroBoxInicio: 3, // cuadro LIBRO/FOLIO (fila de aire arriba y abajo)
  libroBoxFin: 6,
  tituloInicio: 4,
  tituloFin: 5,
  libroNro: 4,
  folioNro: 5,
  ciudad: 7,
  institucion: 8,
  gestion: 9, // + siglas de materia + inicio de cabeceras verticales
  nivel: 10, // + nombres de materia (fusión vertical 10-14)
  carrera: 11,
  regimen: 12,
  curso: 13,
  nomina: 14, // N° / NÓMINA DE ESTUDIANTES
  dataInicio: 15,
  dataFin: 24, // 10 estudiantes por página
  leyendaInicio: 26, // NP = No se Presentó / AP = Aprobado / PRE = Prerrequisito
  firmasAutoridades: 32, // o nota "DOCUMENTO BORRADOR" mientras el libro está ABIERTO
};

/**
 * Offsets de fila de la página de FIRMAS DE DOCENTES (relativos a su base):
 * logo (1-7), título (3-4), primer nombre de docente (9; luego cada
 * FILAS_POR_FIRMA), y el bloque ESTADÍSTICAS 3 filas después de la última
 * materia (título, fila de aire, cabecera, filas).
 */
export const FILA_DOCENTES = {
  tituloInicio: 3,
  tituloFin: 4,
  primerNombre: 9,
  espacioAntesEstadisticas: 3,
};

/**
 * Configuración de página para IMPRESIÓN del libro físico: papel OFICIO
 * (legal, paperSize 5 — como el original), horizontal, ajustado a 1 página de
 * ancho, márgenes uniformes ≈1 cm y centrado horizontal. Solo para este
 * builder. Unidades de márgenes: pulgadas (ExcelJS pageSetup.margins).
 */
export const PAGE_SETUP = {
  paperSize: 5,
  orientation: 'landscape',
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
  horizontalCentered: true,
  margins: {
    left: 0.4,
    right: 0.4,
    top: 0.4,
    bottom: 0.4,
    header: 0.2,
    footer: 0.2,
  },
};

/**
 * Relación de aspecto (ancho/alto) real de `external/templates/ministerio.png`
 * (366×158 px) — misma imagen que el JPEG embebido en el libro físico
 * (337×145 px). El logo se ancla por esquina superior izquierda + tamaño en
 * píxeles (`oneCell`), así nunca se deforma. Actualizar si se reemplaza el
 * asset por uno con proporciones distintas.
 */
export const LOGO_ASPECT_RATIO = 366 / 158;

/**
 * Anclaje del logo medido en el físico (píxeles a 96 dpi): esquina superior
 * izquierda = columna `startCol` (1-based) + `leftPx`, fila `topRow` del
 * bloque + `topOffsetPx`; alto `heightPx` (el ancho sale de la relación de
 * aspecto). Folio: A + 8px, fila 2 + 14px, 100px de alto (≈230px de ancho).
 * Página de firmas de docentes: más grande (138px ≈ 313px de ancho), desde
 * B + 43px, fila 1 + 18px.
 */
export const LOGO_FOLIO = { startCol: 1, leftPx: 8, topRow: 2, topOffsetPx: 14, heightPx: 100 };
export const LOGO_DOCENTES = { startCol: 2, leftPx: 43, topRow: 1, topOffsetPx: 18, heightPx: 138 };

/** Píxeles por punto (96 dpi) y por unidad de ancho Excel (≈7px + 5px de relleno). */
export const PX_POR_PUNTO = 96 / 72;
export const PX_POR_UNIDAD_EXCEL = 7;
export const PX_RELLENO_COLUMNA = 5;

/**
 * Paleta del formulario oficial (todo desde ExcelTheme): texto y bordes negro
 * puro; cabeceras de tabla "Verde oliva, Énfasis 3, claro 60%" (D6E3BC) salvo
 * la fila de SIGLAS de materia, que en el físico lleva el mismo verde en su
 * tono base, más oscuro (9BBB59).
 */
export const DOC_COLOR = {
  ink: EXCEL_COLOR.black,
  border: EXCEL_COLOR.black,
  header: EXCEL_COLOR.officialHeader,
  sigla: EXCEL_COLOR.officialHeaderStrong,
  borrador: EXCEL_COLOR.danger,
};

export default {
  FILAS_POR_FOLIO,
  FILAS_POR_FIRMA,
  COLUMNAS_FIRMAS_DOCENTES,
  COL_WIDTHS,
  FONT_SIZE,
  ROW_HEIGHTS,
  OBS_CHARS_POR_LINEA,
  FILA,
  FILA_DOCENTES,
  PAGE_SETUP,
  LOGO_ASPECT_RATIO,
  LOGO_FOLIO,
  LOGO_DOCENTES,
  PX_POR_PUNTO,
  PX_POR_UNIDAD_EXCEL,
  PX_RELLENO_COLUMNA,
  DOC_COLOR,
};
