/**
 * Configuración declarativa de la hoja de Seguimiento de tutorías a
 * docentes (módulo TIT · titulación, extensión 2026-08-10, rediseño
 * 2026-08-10 a "una hoja por carrera, resumen mensual"). Layout de columnas
 * fijo: Nro TUTORIAS EN EL MES, Nro. TUTORÍAS DESARROLLADAS EN EL MES,
 * DOCENTE, NOMBRE Y APELLIDO DE LOS TUTORIADOS, ACTIVIDAD, PORCENTAJE DE
 * AVANCE, OBSERVACIONES, FIRMA DEL DOCENTE — tabla plana, una fila por
 * tutoriado (resumen del mes consultado), con todos los docentes-tutores de
 * la carrera juntos (columna DOCENTE identifica a cada uno, sin sub-cabeceras).
 */

/** Mapa de columnas (1-based). Columna A = inicio del cuadro (sin margen aparte). */
export const COL = {
  tutoriasMes: 1,
  tutoriasDesarrolladas: 2,
  docente: 3,
  participante: 4,
  actividad: 5,
  avance: 6,
  obs: 7,
  firma: 8,
};

export const LAST_COL = COL.firma;

export const COL_WIDTHS = {
  [COL.tutoriasMes]: 16,
  [COL.tutoriasDesarrolladas]: 18,
  [COL.docente]: 30,
  [COL.participante]: 40,
  [COL.actividad]: 55,
  [COL.avance]: 25,
  [COL.obs]: 45,
  [COL.firma]: 30,
};

/** Relación de aspecto (ancho/alto) del logo institucional (1600×898 px) — informativo, ya no se usa para calcular el tamaño del logo (ver `_logo`, ancla a bordes enteros del bloque al 100%). */
export const LOGO_ASPECT_RATIO = 1600 / 898;

/**
 * Filas fijas de la cabecera institucional (antes de la tabla). El cuadro
 * arranca en A: título (1-2) full-width, logo + CARRERA/GESTIÓN/GENERADO en
 * el bloque A3:C5 (imagen a la izquierda, columnas `tutoriasMes`..`docente`,
 * al 100% del bloque) con el texto a su derecha (columnas
 * `participante`..`firma`) — ver `_logo`/`_cabecera` en SheetBuilder.
 */
export const FILA = {
  tituloInicio: 1,
  tituloFin: 2,
  imagenInicio: 3,
  imagenFin: 5,
  carrera: 3,
  gestion: 4,
  generado: 5,
  header: 6,
  dataInicio: 7,
};

export const ROW_HEIGHTS = {
  titulo: 22,
  // Alto de cada una de las 3 filas del bloque logo + CARRERA/GESTIÓN/GENERADO
  // (FILA.imagenInicio..imagenFin).
  cabecera: 26,
  // Antes 34: a fuente `small` (14pt) el encabezado "ACTIVIDAD (DETALLAR EL
  // AVANCE DEL PROYECTO...)" envuelve en 3 líneas y quedaba cortado.
  header: 64,
  // Piso; las filas de datos crecen dinámicamente según el texto más largo
  // (docente/participante/actividad/observaciones) — ver estimateWrappedLines
  // en SheetBuilder.
  dataRow: 22,
  firma: 30,
};

/**
 * Configuración de impresión: apaisada + ajustada a 1 página de ancho (la
 * tabla es más ancha que una hoja carta vertical) — mismo criterio que
 * `libroRegistroSheetConfig.PAGE_SETUP`, sin margen de encuadernado (esta
 * planilla no se empasta).
 */
export const PAGE_SETUP = {
  orientation: 'landscape',
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
  margins: {
    left: 0.4,
    right: 0.4,
    top: 0.4,
    bottom: 0.4,
    header: 0.2,
    footer: 0.2,
  },
};

/** Nombre de mes en español para la cabecera (mes calendario administrativo). */
export const MESES_NOMBRE = {
  1: 'ENERO',
  2: 'FEBRERO',
  3: 'MARZO',
  4: 'ABRIL',
  5: 'MAYO',
  6: 'JUNIO',
  7: 'JULIO',
  8: 'AGOSTO',
  9: 'SEPTIEMBRE',
  10: 'OCTUBRE',
  11: 'NOVIEMBRE',
  12: 'DICIEMBRE',
};
