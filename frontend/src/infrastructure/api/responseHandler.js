import { resolveInscripcionApiUserMessage } from '@application-matricula/registro/utils/inscripcionApiErrors';

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
 * @returns {{success: boolean, data?: Array|Object, error?: string|Object}}
 */
/**
 * @param {string} baseMessage
 * @param {{ details?: unknown } | null} errorData
 */
function appendValidationDetailsToMessage(baseMessage, errorData) {
  const details = errorData?.details;
  if (!Array.isArray(details) || !details.length) {
    return baseMessage;
  }
  const lines = details.map((d) => {
    if (d == null) return null;
    if (typeof d === 'string') return `• ${d}`;
    if (typeof d !== 'object') return `• ${String(d)}`;
    const { cursoId, dia, horaInicio, horaFin, reason, field, invalid, message } = d;
    if (field != null && message != null) {
      return `• ${field}: ${message}`;
    }
    if (field != null && invalid != null) {
      return `• ${field}: ${Array.isArray(invalid) ? invalid.join(', ') : String(invalid)}`;
    }
    const time =
      horaInicio != null && horaFin != null ? `${horaInicio} – ${horaFin}` : '';
    const curso = cursoId != null ? `curso #${cursoId}` : '';
    let cause = '';
    if (reason === 'HORARIO_NO_EXISTE') {
      cause = 'esa franja no existe en el catálogo de horarios del sistema.';
    } else if (reason) {
      cause = String(reason);
    }
    if (dia && time) {
      return `• ${dia} ${time}${curso ? ` (${curso})` : ''}: ${cause || 'revisar datos.'}`;
    }
    return `• ${JSON.stringify(d)}`;
  });
  const filtered = lines.filter(Boolean);
  if (!filtered.length) return baseMessage;
  return `${baseMessage}\n\n${filtered.join('\n')}`;
}

export function handleSuccessResponse(response) {
  const responseData = response.data;
  
  // Si el backend devuelve success: false, tratarlo como error
  if (responseData.success === false) {
    return {
      success: false,
      error: responseData.error || 'Error en la respuesta del servidor',
    };
  }
  
  // Si hay error en la respuesta, retornar error
  if (responseData.error) {
    return {
      success: false,
      error: responseData.error,
    };
  }
  
  // Si hay data, retornar los datos
  const data = responseData.data || null;

  const out = {
    success: true,
    data,
  };
  if (responseData.pagination) {
    out.pagination = responseData.pagination;
  }
  return out;
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
    
    // Extraer el mensaje de error (priorizar message si es objeto)
    let errorMessage = defaultMessage;
    
    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      // Si tiene message, usarlo
      if (errorData.message) {
        errorMessage = errorData.message;
      } 
      // Si tiene code pero no message, construir mensaje con code
      else if (errorData.code) {
        errorMessage = errorData.code;
      }
      // Si es un objeto sin estructura conocida, intentar stringify
      else {
        errorMessage = JSON.stringify(errorData);
      }
    }

    const withDetails =
      typeof errorData === 'object' && errorData != null
        ? appendValidationDetailsToMessage(errorMessage, errorData)
        : errorMessage;

    const { message: safeMessage } = resolveInscripcionApiUserMessage(withDetails, errorData);

    // Retornar objeto con error como string y opcionalmente el objeto completo para casos especiales
    return {
      success: false,
      error: safeMessage,
      errorDetails: typeof errorData === 'object' ? errorData : null, // Objeto completo opcional
    };
  }
  
  // Si no hay response (error de red, timeout, etc.), usar el mensaje del error
  return {
    success: false,
    error: error.message || defaultMessage,
  };
}

