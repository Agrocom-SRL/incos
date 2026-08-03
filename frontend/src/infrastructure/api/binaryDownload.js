/**
 * Helpers de descarga binaria (.xlsx/.pdf) para repositorios HTTP.
 *
 * Single Responsibility: extraer el nombre de archivo del header
 * `Content-Disposition` y traducir errores que llegan como Blob JSON.
 * Fuente única para los repos nuevos (Avance académico, Deserción,
 * Consolidado de asistencia); los repos previos conservan su copia local
 * hasta su propio refactor.
 */

/**
 * Extrae el nombre de archivo del header Content-Disposition.
 * Soporta `filename*=UTF-8''…`, `filename="…"` y `filename=…`.
 *
 * @param {string} disposition - Header `content-disposition` de la respuesta.
 * @param {string} fallback - Nombre por defecto si el header no lo trae.
 * @returns {string}
 */
export const extractFileNameFromDisposition = (disposition = '', fallback) => {
  const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
  if (starMatch) {
    try {
      return decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
    } catch {
      return starMatch[1];
    }
  }
  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  if (quotedMatch) return quotedMatch[1];
  const plainMatch = disposition.match(/filename=([^;\s]+)/i);
  if (plainMatch) return plainMatch[1].replace(/['"]/g, '');
  return fallback;
};

/**
 * Cuando un endpoint binario falla, axios entrega el error como Blob; este
 * helper intenta leerlo como JSON del contrato `{ error: { message } }`.
 *
 * @param {Error} error - Error de axios de una petición `responseType: 'blob'`.
 * @param {string} defaultMessage - Mensaje si el Blob no es JSON legible.
 * @returns {Promise<string|null>} Mensaje de error o null si no era Blob.
 */
export const readBlobErrorMessage = async (error, defaultMessage) => {
  if (!(error.response?.data instanceof Blob)) return null;
  try {
    const text = await error.response.data.text();
    const json = JSON.parse(text);
    const errObj = json?.error;
    return typeof errObj === 'string'
      ? errObj
      : errObj?.message || json?.message || defaultMessage;
  } catch {
    return null;
  }
};
