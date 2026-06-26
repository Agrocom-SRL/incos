/**
 * Paleta CATEGÓRICA por tramo de beca (fuente única para donut + catálogo).
 *
 * Antes el donut usaba 3 verdes casi idénticos + ámbar y los tramos no se
 * distinguían. Aquí cada tramo recibe un color VÍVIDO y bien diferenciado,
 * derivado SIEMPRE de los tokens del theme de marca (sin #hex), siguiendo una
 * progresión intuitiva "más beca → color más intenso":
 *   25 % verde · 50 % dorado · 75 % púrpura · 100 % rojo.
 *
 * El mapeo es por PORCENTAJE (no por índice) para que el color de cada tramo
 * sea estable aunque cambie el orden o falte un tramo. Tramos fuera de catálogo
 * caen a una escala de respaldo, también por tokens.
 */

/** Mapa porcentaje → color (token del theme). */
export const buildTramoPalette = (token) => ({
  25: token.colorSuccess, // verde marca
  50: token.colorWarning, // dorado
  75: token.colorAccent, // púrpura
  100: token.colorError, // rojo
});

/** Escala de respaldo para tramos no contemplados (también por tokens). */
const buildFallbackScale = (token) => [
  token.colorSuccess,
  token.colorWarning,
  token.colorAccent,
  token.colorError,
  token.colorInfo,
  token.colorPrimary,
];

/**
 * Color de un tramo de beca.
 * @param {Object} token - token de `theme.useToken()`.
 * @param {number|string} porcentaje - tramo (25/50/75/100/...).
 * @param {number} [index=0] - posición, solo para el respaldo.
 * @returns {string} color CSS.
 */
export const getTramoColor = (token, porcentaje, index = 0) => {
  const paleta = buildTramoPalette(token);
  const directo = paleta[Number(porcentaje)];
  if (directo) return directo;
  const fallback = buildFallbackScale(token);
  return fallback[index % fallback.length];
};

/**
 * Escala CATEGÓRICA por ENTIDAD (carrera/periodo/paralelo) para las barras de
 * cobertura por nivel. Distinta progresión que la de tramos (arranca en el verde
 * de marca) y, como todo aquí, derivada de tokens del theme (sin #hex).
 */
const buildEntidadScale = (token) => [
  token.colorPrimary,
  token.colorSuccess,
  token.colorWarning,
  token.colorAccent,
  token.colorInfo,
  token.colorError,
];

/**
 * Color de una entidad por su posición (estable dentro del mismo nivel).
 * @param {Object} token - token de `theme.useToken()`.
 * @param {number} [index=0] - posición de la entidad en la lista.
 * @returns {string} color CSS.
 */
export const getEntidadColor = (token, index = 0) => {
  const scale = buildEntidadScale(token);
  return scale[index % scale.length];
};

export default getTramoColor;
