/**
 * Valida y normaliza puntos obtenidos en una celda (entero 0..maxPuntos).
 * undefined = entrada inválida (ignorar).
 */

export const parseNotaInput = (raw, maxPuntos = 100) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  const max = Math.round(Number(maxPuntos));
  if (Number.isNaN(n) || !Number.isInteger(n) || n < 0 || n > max) return undefined;
  return n;
};
