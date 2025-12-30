/**
 * Helper para manejar respuestas y errores del API
 * 
 * Single Responsibility: Centralizar la lógica de manejo de respuestas y errores
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración de cómo se procesan las respuestas HTTP
 * 
 * El backend siempre devuelve: { status, data, error }
 * - Si hay data: data contiene los datos, error es null
 * - Si hay error: error contiene el mensaje, data es null
 * - Ambos tienen status
 */

/**
 * Procesa una respuesta exitosa del backend
 * 
 * @param {Object} response - Respuesta de axios
 * @returns {{success: boolean, data?: Array|Object, error?: string}}
 */
export function handleSuccessResponse(response) {
  const responseData = response.data;
  
  // Si hay error en la respuesta, retornar error
  if (responseData.error) {
    return {
      success: false,
      error: responseData.error,
    };
  }
  
  // Si hay data, retornar los datos
  const data = responseData.data || null;
  
  return {
    success: true,
    data: data,
  };
}

/**
 * Procesa un error del backend (HTTP 4xx, 5xx o error de red)
 * 
 * @param {Error} error - Error de axios
 * @param {string} defaultMessage - Mensaje por defecto si no se puede extraer el error
 * @returns {{success: boolean, error: string}}
 */
export function handleErrorResponse(error, defaultMessage = 'Error en la petición') {
  // Si hay error.response, el backend respondió con un error HTTP
  // El backend devuelve: { status, data, error }
  if (error.response?.data?.error) {
    return {
      success: false,
      error: error.response.data.error,
    };
  }
  
  // Si no hay response (error de red, timeout, etc.), usar el mensaje del error
  return {
    success: false,
    error: error.message || defaultMessage,
  };
}

/**
 * Procesa una respuesta del backend (éxito o error)
 * Útil para respuestas que pueden tener error dentro de la respuesta exitosa
 * 
 * @param {Object} response - Respuesta de axios
 * @returns {{success: boolean, data?: Array|Object, error?: string}}
 */
export function handleResponse(response) {
  return handleSuccessResponse(response);
}

