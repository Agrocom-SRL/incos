/**
 * libroRegistroSheetConfig — configuración declarativa de la hoja del Libro de
 * registro (un paralelo; folios apilados verticalmente, réplica del libro
 * físico "LIBRO LLENADO SISTEMAS 11 dic 2025": bloques de 34 filas).
 *
 * Centraliza anchos, alturas, offsets de fila del bloque de folio y colores de
 * ESTADO. Colores desde ExcelTheme (sin hex sueltos).
 */

import { EXCEL_COLOR } from '../../shared/index.js';

/** Alto del bloque de un folio (filas), como en el libro real (folio 56 = filas 1-34). */
export const FILAS_POR_FOLIO = 34;

/** Anchos de columna (unidades Excel) por rol semántico. */
export const COL_WIDTHS = {
  nro: 5, // A — N°
  nombreIzq: 12, // B — 1ra columna de NÓMINA (par B:C)
  nombreDer: 34, // C — 2da columna de NÓMINA (valores de cabecera también van en C)
  ci: 16, // D — CÉDULA DE IDENTIDAD
  asignatura: 10, // una columna por materia
  estado: 9, // cada una de las 2 columnas de ESTADO
  obs: 9, // cada una de las 4 columnas de OBSERVACIONES
};

/** Alturas de fila (puntos) por rol semántico. */
export const ROW_HEIGHTS = {
  titulo: 22, // filas de la banda CENTRALIZADOR DE CALIFICACIONES
  cabecera: 18, // filas de campos (INSTITUCIÓN/GESTIÓN/...)
  siglas: 20, // fila de siglas de materia
  nombresMateria: 64, // fila (fusionada 5 filas) de nombres de materia
  dataRow: 18, // fila de estudiante
  firmas: 16,
};

/**
 * Offsets de fila DENTRO del bloque de un folio (1-based, relativos al inicio
 * del bloque). Espejo del libro real: código de registro (1), escudo/logo
 * (2-6), título+LIBRO/FOLIO (4-5), ciudad/turno (7), institución/R.M./carácter
 * (8), gestión+siglas (9), nivel+nombres de materia (10-13 fusionados hasta
 * 14), carrera (11), régimen (12), curso (13), cabecera de nómina (14),
 * estudiantes (15-24), firmas de autoridades (32).
 */
export const FILA = {
  codigoRegistro: 1,
  logoInicio: 2,
  logoFin: 6,
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
  firmasAutoridades: 32,
};

/**
 * Configuración de página para IMPRESIÓN/ENCUADERNADO del libro físico:
 * horizontal, ajustada al ancho, margen IZQUIERDO más ancho (lado del
 * encuadernado). Solo para este builder — no altera defaults de otros reportes.
 * Unidades de márgenes: pulgadas (ExcelJS pageSetup.margins).
 */
export const PAGE_SETUP = {
  orientation: 'landscape',
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
  margins: {
    left: 0.9, // lado de encuadernado
    right: 0.3,
    top: 0.4,
    bottom: 0.4,
    header: 0.2,
    footer: 0.2,
  },
};

/** Tamaño del logo del Ministerio en la cabecera de cada folio (px). */
export const LOGO_EXT = { width: 120, height: 78 };

/** Color de texto de la columna ESTADO por valor. */
export const ESTADO_COLOR = {
  APROBADO: EXCEL_COLOR.finalHeader,
  REPROBADO: EXCEL_COLOR.danger,
  ABANDONO: EXCEL_COLOR.inkSoft,
};

export default {
  FILAS_POR_FOLIO,
  COL_WIDTHS,
  ROW_HEIGHTS,
  FILA,
  PAGE_SETUP,
  LOGO_EXT,
  ESTADO_COLOR,
};
