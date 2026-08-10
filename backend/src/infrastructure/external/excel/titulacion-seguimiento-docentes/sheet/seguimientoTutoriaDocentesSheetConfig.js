/**
 * Configuración declarativa de la hoja de Seguimiento de tutorías a
 * docentes (módulo TIT · titulación, extensión 2026-08-10). Layout de
 * columnas fijo (réplica de "PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx"):
 * N°, NOMBRE Y APELLIDO DE LOS TUTORIADOS, ACTIVIDAD, PORCENTAJE DE AVANCE,
 * OBSERVACIONES, FIRMA DEL DOCENTE.
 */

/** Mapa de columnas (1-based; columna 1 = margen). */
export const COL = {
  margen: 1,
  nro: 2,
  nombre: 3,
  actividad: 4,
  avance: 5,
  obs: 6,
  firma: 7,
};

export const LAST_COL = COL.firma;

export const COL_WIDTHS = {
  [COL.margen]: 3,
  [COL.nro]: 6,
  [COL.nombre]: 32,
  [COL.actividad]: 42,
  [COL.avance]: 13,
  [COL.obs]: 34,
  [COL.firma]: 24,
};

/** Filas fijas de la cabecera institucional (antes de la tabla de tutoriados). */
export const FILA = {
  tituloInicio: 1,
  tituloFin: 2,
  docente: 3,
  carrera: 4,
  info: 5,
  header: 7,
  dataInicio: 8,
};

export const ROW_HEIGHTS = {
  titulo: 22,
  header: 34,
  dataRow: 22,
  firma: 30,
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
