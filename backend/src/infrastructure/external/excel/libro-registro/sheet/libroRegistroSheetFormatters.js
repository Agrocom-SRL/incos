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

export default { formatNotaFolio, esNotaNP };
