/**
 * Valida y normaliza nota 0–100 (máx. 2 decimales). undefined = entrada inválida (ignorar).
 */

export const parseNotaInput = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0 || n > 100) return undefined;
  return Math.round(n * 100) / 100;
};
