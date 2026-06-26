/**
 * centralizadorSheetLayout — aritmética PURA de columnas de la hoja del
 * Centralizador. Dado el nº de asignaturas (o el arreglo de asignaturas),
 * resuelve el mapa de columnas de la tabla. No toca el composer ni ExcelJS:
 * solo cálculo, de modo que sea trivialmente testeable y reutilizable por un
 * libro multi-paralelo.
 */

import { COLS_POR_ASIGNATURA } from './centralizadorSheetConfig.js';

/**
 * Calcula el mapa de columnas de la matriz estudiantes × asignaturas.
 * NÓMINA DE ESTUDIANTES ocupa 3 columnas físicas combinadas (C:E) para repartir
 * el ancho del nombre sin una sola columna ancha; CÉDULA queda en F y las
 * asignaturas arrancan en G (cada una en su bloque de `COLS_POR_ASIGNATURA`).
 *
 * @param {Array|number} asignaturas - arreglo de asignaturas o su cantidad.
 * @returns {{
 *   COL_NRO:number, COL_NOMBRE_START:number, COL_NOMBRE_END:number, COL_CI:number,
 *   FIRST_SUBJECT_COL:number, subjectBlock:(i:number)=>number,
 *   lastSubjectCol:number, COL_ESTADO:number, COL_OBS_START:number,
 *   COL_OBS_END:number, lastCol:number
 * }}
 */
export const computeColumnMap = (asignaturas) => {
  const count = Array.isArray(asignaturas) ? asignaturas.length : Number(asignaturas) || 0;

  const COL_NRO = 2; // B (col A queda como margen)
  const COL_NOMBRE_START = 3; // C — NÓMINA DE ESTUDIANTES (C:E combinadas)
  const COL_NOMBRE_END = 5; // E
  const COL_CI = 6; // F — CÉDULA DE IDENTIDAD
  const FIRST_SUBJECT_COL = 7; // G — primera columna de asignaturas

  const subjectBlock = (i) => FIRST_SUBJECT_COL + i * COLS_POR_ASIGNATURA;

  const lastSubjectCol =
    count > 0 ? subjectBlock(count - 1) + (COLS_POR_ASIGNATURA - 1) : COL_CI;

  const COL_ESTADO = lastSubjectCol + 1;
  const COL_OBS_START = COL_ESTADO + 1;
  const COL_OBS_END = COL_OBS_START + 1;
  const lastCol = COL_OBS_END;

  return {
    COL_NRO,
    COL_NOMBRE_START,
    COL_NOMBRE_END,
    COL_CI,
    FIRST_SUBJECT_COL,
    subjectBlock,
    lastSubjectCol,
    COL_ESTADO,
    COL_OBS_START,
    COL_OBS_END,
    lastCol
  };
};

export default { computeColumnMap };
