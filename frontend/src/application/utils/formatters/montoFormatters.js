/**
 * Formateo de montos en bolivianos (Bs).
 *
 * Los aportes del instituto se manejan en montos ENTEROS, así que la presentación
 * muestra solo la parte entera con separador de miles es-BO ("1.200"). La etiqueta
 * "Bs" la pone el componente/columna, no esta función.
 */

/**
 * Formatea un valor numérico a un entero con separador de miles (es-BO).
 * @param {number|string|null|undefined} value
 * @returns {string} p. ej. "1.200" (sin símbolo ni decimales)
 */
export const formatBs = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Igual que `formatBs` pero anteponiendo el símbolo: "Bs 1.200".
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export const formatBsConSimbolo = (value) => `Bs ${formatBs(value)}`;
