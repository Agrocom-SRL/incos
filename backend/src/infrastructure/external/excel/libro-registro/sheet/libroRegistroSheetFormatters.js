/**
 * libroRegistroSheetFormatters — helpers de formato PURO de la hoja del Libro
 * de registro. Convierten valores de dominio en su representación de celda.
 */

/**
 * Nota de la celda del folio: 'NP' pasa tal cual (leyenda del documento);
 * números como entero o con 2 decimales; vacío si no hay valor.
 * @param {number|string|null|undefined} nota
 * @returns {number|string}
 */
export const formatNotaFolio = (nota) => {
  if (nota == null || nota === '') return '';
  if (typeof nota === 'string' && Number.isNaN(Number(nota))) return nota; // 'NP'
  const n = Number(nota);
  return Number.isInteger(n) ? n : Math.round(n * 100) / 100;
};

/** true si la celda lleva la leyenda NP (sin nota / abandono). */
export const esNotaNP = (nota) => typeof nota === 'string' && Number.isNaN(Number(nota));

/**
 * Valor de la celda CÉDULA DE IDENTIDAD: número cuando la cédula es solo
 * dígitos y no tiene expedición (así la escribe el físico y Excel NO marca
 * el triángulo verde de "número guardado como texto"); texto cuando lleva
 * sufijo de expedición ("9278759 BE") o caracteres no numéricos.
 * @param {string|number|null|undefined} ci
 * @param {string|null|undefined} expedicion
 * @returns {number|string}
 */
export const formatCedulaFolio = (ci, expedicion) => {
  const base = String(ci ?? '').trim();
  const exp = String(expedicion ?? '').trim();
  if (!base) return '';
  if (exp) return `${base} ${exp}`;
  return /^\d+$/.test(base) ? Number(base) : base;
};

/**
 * Líneas que ocupa una observación al envolverse en la celda (estimación por
 * caracteres): 1 si cabe en una línea, 2 en adelante si la excede.
 * @param {string|null|undefined} texto
 * @param {number} charsPorLinea
 * @returns {number}
 */
export const estimarLineasObservacion = (texto, charsPorLinea) => {
  const largo = String(texto ?? '').trim().length;
  if (largo === 0 || charsPorLinea <= 0) return 1;
  return Math.max(1, Math.ceil(largo / charsPorLinea));
};

export default { formatNotaFolio, esNotaNP, formatCedulaFolio, estimarLineasObservacion };
