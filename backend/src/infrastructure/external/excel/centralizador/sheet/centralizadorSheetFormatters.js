/**
 * centralizadorSheetFormatters — helpers de formato PURO de la hoja del
 * Centralizador. Sin estado ni dependencias del composer: convierten valores de
 * dominio en su representación de celda y centralizan la regla de formato visual
 * de "nota reprobada".
 */

/** Formatea una nota para la celda (entero si es redondo; — si no hay nota). */
export const formatNota = (nota) => {
  if (nota == null || Number.isNaN(Number(nota))) return '—';
  const n = Number(nota);
  return Number.isInteger(n) ? n : Math.round(n * 100) / 100;
};

/**
 * Regla de formato visual (no de negocio): una nota se pinta como reprobada
 * cuando existe y es estrictamente menor que la nota mínima de aprobación.
 * Centraliza el cálculo que antes se repetía en la fila de cada estudiante.
 * @param {number|null|undefined} nota
 * @param {number} notaMin
 * @returns {boolean}
 */
export const esNotaReprobada = (nota, notaMin) =>
  nota != null && Number.isFinite(notaMin) && Number(nota) < notaMin;

export default { formatNota, esNotaReprobada };
