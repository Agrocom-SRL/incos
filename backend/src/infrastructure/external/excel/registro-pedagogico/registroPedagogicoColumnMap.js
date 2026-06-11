/**
 * Mapa de columnas del Registro Pedagógico (hoja CONSOLIDADO) en función del
 * número de evaluaciones de cada componente. Parámetro compartido por ambas
 * hojas: la PLANILLA referencia las columnas de promedio del CONSOLIDADO.
 */

import { colLetter } from '../shared/index.js';

export const L = colLetter;

export const buildColumnMap = (numPract, numTeo) => {
  const colNro = 2;
  const colNombre = 3;
  const colPractStart = 4;
  const colPractEnd = numPract > 0 ? colPractStart + numPract - 1 : colPractStart - 1;
  const colPromPract = colPractEnd + 1;
  const colTeoStart = colPromPract + 1;
  const colTeoEnd = numTeo > 0 ? colTeoStart + numTeo - 1 : colTeoStart - 1;
  const colPromTeo = colTeoEnd + 1;
  const colFinal = colPromTeo + 1;
  const colObs = colFinal + 1;
  const colNoPract = colObs + 1;
  const colNoTeo = colNoPract + 1;
  const colNoEval = colNoTeo + 1;

  return {
    colNro,
    colNombre,
    colPractStart,
    colPractEnd,
    colPromPract,
    colTeoStart,
    colTeoEnd,
    colPromTeo,
    colFinal,
    colObs,
    colNoPract,
    colNoTeo,
    colNoEval,
    lastCol: colNoEval,
    practRange: (row) => `${L(colPractStart)}${row}:${L(colPractEnd)}${row}`,
    teoRange: (row) => `${L(colTeoStart)}${row}:${L(colTeoEnd)}${row}`
  };
};

export default { buildColumnMap, L };
