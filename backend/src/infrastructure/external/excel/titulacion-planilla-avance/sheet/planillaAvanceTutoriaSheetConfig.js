/**
 * Configuración declarativa de la hoja de la Planilla de avance de tutorías
 * "10 en 10" (módulo TIT · titulación). Layout de columnas fijo (no depende
 * de materias, a diferencia del Libro de registro): N°, NÓMINA, C.I., TUTOR,
 * Nº TUTORÍAS DEL BIMESTRE, % AVANCE, OBSERVACIONES.
 */

/** Filas que ocupa CADA folio (10 estudiantes + cabecera + aire de página). */
export const FILAS_POR_FOLIO = 16;

/** Mapa de columnas (1-based; columna 1 = margen). */
export const COL = {
  margen: 1,
  nro: 2,
  nombre: 3,
  ci: 4,
  tutor: 5,
  tutorias: 6,
  avance: 7,
  obs: 8,
};

export const LAST_COL = COL.obs;

export const COL_WIDTHS = {
  [COL.margen]: 3,
  [COL.nro]: 6,
  [COL.nombre]: 34,
  [COL.ci]: 14,
  [COL.tutor]: 26,
  [COL.tutorias]: 14,
  [COL.avance]: 11,
  [COL.obs]: 30,
};

/** Filas del bloque de UN folio (offset desde `base`). */
export const FILA = {
  tituloInicio: 1,
  tituloFin: 2,
  info: 3,
  header: 4,
  dataInicio: 5,
  dataFin: 14, // 10 filas de estudiantes (5..14)
  spacer: 15,
};

export const ROW_HEIGHTS = {
  titulo: 22,
  header: 30,
  dataRow: 18,
};

/** Color de texto por resultado_tutoria (paridad con el estado en pantalla). */
export const RESULTADO_COLOR = {
  APROBADO: 'FF166534',
  REPROBADO: 'FFB91C1C',
  ABANDONO: 'FF92400E',
  EN_PROCESO: 'FF475569',
};
