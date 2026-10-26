/**
 * Entero positivo estricto para ids que llegan en el body.
 * Acepta un number entero >= 1 o un string de solo dígitos ('3'); rechaza '3abc', '1.5', ' 3', '0', arrays y booleanos.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const esEnteroPositivoEstricto = (value) => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 1;
  if (typeof value === 'string') return /^\d{1,15}$/.test(value) && Number(value) >= 1;
  return false;
};
