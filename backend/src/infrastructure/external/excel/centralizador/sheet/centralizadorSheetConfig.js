/**
 * centralizadorSheetConfig — configuración declarativa de la hoja del
 * Centralizador de Calificaciones (un paralelo, un bimestre).
 *
 * Centraliza, en un único lugar y sin literales sueltos, el grano de columnas
 * por asignatura, los anchos de columna, las alturas de fila, los índices de
 * las filas de cabecera y el color de texto del ESTADO. Todos los colores salen
 * de ExcelTheme (no hex crudos), de modo que el SheetBuilder solo describe QUÉ
 * va en cada sección y nunca CÓMO se dimensiona o tinta.
 */

import { EXCEL_COLOR } from '../../shared/index.js';

/** Cada asignatura ocupa un bloque de 2 columnas (cabecera y nota fusionadas). */
export const COLS_POR_ASIGNATURA = 2;

/** Anchos de columna (unidades de Excel) por rol semántico. */
export const COL_WIDTHS = {
  margin: 3, // col A — margen izquierdo
  nro: 6, // Nº
  nombreCol: 15, // cada una de las 3 columnas de NÓMINA (C:E ≈ 45 en total)
  ci: 18, // CÉDULA DE IDENTIDAD (col F)
  asignatura: 11, // cada columna de un bloque de asignatura
  estado: 16, // ESTADO
  obs: 16 // cada columna de OBSERVACIONES
};

/** Alturas de fila (puntos) por rol semántico. */
export const ROW_HEIGHTS = {
  band: 30, // banda de título (fila 1)
  subtitle: 24, // subtítulo institucional (fila 2)
  sigla: 24, // cabecera: sigla de asignatura (fila 8)
  nombre: 54, // cabecera: nombre de asignatura (fila 9)
  docente: 34, // cabecera: docente de asignatura (fila 10)
  dataRow: 22 // fila de estudiante (mismo alto que PlanillaCalificaciones/Consolidado con fuente small)
};

/** Índices (1-based) de las filas de cabecera y de la primera fila de datos. */
export const HEADER_ROWS = {
  rowSigla: 8,
  rowNombre: 9,
  rowDocente: 10,
  rowMin: 11, // nota mínima de aprobación
  firstDataRow: 12
};

/** Color de texto del ESTADO por valor (aprobado / reprobado / cursando / abandono). */
export const ESTADO_COLOR = {
  APROBADO: EXCEL_COLOR.finalHeader,
  REPROBADO: EXCEL_COLOR.danger,
  // CURSANDO: bimestre aún en curso (sin todas las notas). Tono sobrio reutilizado
  // de la paleta (texto secundario) — sin hex suelto.
  CURSANDO: EXCEL_COLOR.inkSoft,
  ABANDONO: EXCEL_COLOR.inkSoft
};

export default {
  COLS_POR_ASIGNATURA,
  COL_WIDTHS,
  ROW_HEIGHTS,
  HEADER_ROWS,
  ESTADO_COLOR
};
