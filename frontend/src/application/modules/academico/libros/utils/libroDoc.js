/**
 * Constantes institucionales del documento "Libro de registro" (espejo de
 * `backend/src/domain/constants/libros.constants.js` — LIBRO_REGISTRO_DOC +
 * CODIGO_REGISTRO_INSTITUCIONAL + ESTUDIANTES_POR_FOLIO). Metadatos de la
 * cabecera del folio físico que NO viven en una tabla propia; se centralizan
 * aquí para que `FolioPreviewPage` no los incruste en el JSX.
 *
 * Base documental: "LIBRO LLENADO SISTEMAS 11 dic 2025" (folio real, máx. 10
 * estudiantes, firmas de Jefe de Carrera / Director Académico / Rector).
 */

export const LIBRO_DOC = {
  titulo: 'CENTRALIZADOR DE CALIFICACIONES',
  institucion: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
  ciudad: 'Santa Cruz - Bolivia',
  nivel: 'TÉCNICO SUPERIOR',
  regimen: 'ANUAL',
  caracter: 'FISCAL',
  resolucionMinisterial: '0426/2016',
  firmas: ['JEFE(A) DE CARRERA', 'DIRECTOR(A) ACADÉMICO(A)', 'RECTOR(A)'],
  /** Leyenda de abreviaturas de la nómina (misma leyenda del export Excel). */
  leyendaNotas: 'NP = No se Presentó',
};

/**
 * Sugerencia visual del código de registro institucional en el alta del libro
 * (el backend no lo fuerza: si el campo llega vacío, aplica el mismo default).
 */
export const CODIGO_REGISTRO_SUGERIDO = '81981609';

/** Máximo de estudiantes por folio (página del centralizador). */
export const ESTUDIANTES_POR_FOLIO = 10;

export default LIBRO_DOC;
