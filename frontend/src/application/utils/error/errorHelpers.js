/**
 * Helpers para normalización de errores
 * 
 * Single Responsibility: Normalizar errores de diferentes formatos a strings consistentes
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades para manejo de errores en hooks
 * - Normaliza errores de Use Cases, excepciones y respuestas del backend
 * 
 * Este helper es genérico y puede ser usado en cualquier hook que necesite
 * normalizar errores para mostrarlos en la UI.
 */

/**
 * Normaliza un error a un string legible
 * 
 * El error puede venir en diferentes formatos:
 * - string: "Error message"
 * - object con message: { message: "Error message" }
 * - object con error: { error: "Error message" }
 * - Error instance: new Error("Error message")
 * - null/undefined: retorna mensaje por defecto
 * 
 * @param {string|Object|Error|null|undefined} error - Error a normalizar
 * @param {string} defaultMessage - Mensaje por defecto si el error no es válido
 * @returns {string} Mensaje de error normalizado
 */
export function normalizeError(error, defaultMessage = 'Ha ocurrido un error') {
  // Si es null o undefined, retornar mensaje por defecto
  if (error === null || error === undefined) {
    return defaultMessage;
  }

  // Si es un string, retornarlo directamente
  if (typeof error === 'string') {
    return error.trim() || defaultMessage;
  }

  // Si es una instancia de Error, retornar su mensaje
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Si es un objeto, intentar extraer el mensaje
  if (typeof error === 'object') {
    // Prioridad 1: error.message (formato estándar)
    if (error.message && typeof error.message === 'string') {
      return error.message.trim() || defaultMessage;
    }

    // Prioridad 2: error.error (formato alternativo)
    if (error.error && typeof error.error === 'string') {
      return error.error.trim() || defaultMessage;
    }

    // Prioridad 3: error.toString() si está disponible
    if (typeof error.toString === 'function') {
      const stringified = error.toString();
      if (stringified && stringified !== '[object Object]') {
        return stringified;
      }
    }
  }

  // Si no se pudo normalizar, retornar mensaje por defecto
  return defaultMessage;
}

/**
 * Extrae el mensaje de error de un resultado de Use Case
 * 
 * Los Use Cases retornan: { success: boolean, error?: string|object, data?: any }
 * 
 * @param {Object} result - Resultado del Use Case
 * @param {string} defaultMessage - Mensaje por defecto si no hay error válido
 * @returns {string|null} Mensaje de error normalizado o null si no hay error
 */
export function extractErrorFromResult(result, defaultMessage = 'Ha ocurrido un error') {
  if (!result || result.success !== false) {
    return null;
  }

  return normalizeError(result.error, defaultMessage);
}
