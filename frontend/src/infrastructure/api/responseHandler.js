/**
 * Helper para manejar respuestas y errores del API
 * 
 * Single Responsibility: Centralizar la lógica de manejo de respuestas y errores
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación de procesamiento de respuestas HTTP
 * 
 * NOTA: Este archivo está en infrastructure/api/ porque:
 * 1. Es parte de la implementación del cliente HTTP
 * 2. Tiene lógica de procesamiento (no solo configuración estática)
 * 3. Es específico del cliente HTTP (no es configuración general)
 * 
 * La configuración estática (API_CONFIG) está en config/api/
 * La implementación (client, interceptors, responseHandler) está en api/
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
 * @returns {{success: boolean, error: string|Object}}
 * 
 * El backend puede retornar errores con estructura:
 * - Simple: { success: false, error: { code: 'ERROR', message: '...' } }
 * - Validación: { success: false, error: { code: 'VALIDATION_ERROR', message: '...', details: [...] } }
 */
export function handleErrorResponse(error, defaultMessage = 'Error en la petición') {
  // Si hay error.response, el backend respondió con un error HTTP
  if (error.response?.data?.error) {
    const errorData = error.response.data.error;
    
    // Si el error tiene estructura completa (code, message, details), retornarlo completo
    if (typeof errorData === 'object' && errorData.code && errorData.message) {
      return {
        success: false,
        error: errorData, // Objeto completo con code, message, details
      };
    }
    
    // Si es un string simple, retornarlo como string
    return {
      success: false,
      error: typeof errorData === 'string' ? errorData : errorData.message || defaultMessage,
    };
  }
  
  // Si no hay response (error de red, timeout, etc.), usar el mensaje del error
  return {
    success: false,
    error: error.message || defaultMessage,
  };
}

