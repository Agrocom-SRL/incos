/**
 * Normaliza puntos de una celda (entero ≥ 0). El tope por actividad se valida en la UI.
 * undefined = entrada inválida (ignorar).
 */

export const parseNotaInput = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) return undefined;
  return n;
};
