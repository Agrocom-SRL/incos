import { TIPOS_ORIGEN_VALUES, TIPOS_ORIGEN } from '../constants/index.js';

/**
 * Utilidades para normalización de valores relacionados con StudentOrigin
 *
 * Responsabilidades:
 * - Normalizar valores de tipo de origen desde diferentes formatos (números, strings) a ENUM
 * - Funciones puras sin dependencias externas (excepto constantes del dominio)
 *
 * Ubicación: domain/utils (capa de dominio - funciones puras sin dependencias)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo normalización de valores de tipo de origen
 * - Open/Closed: Extensible para nuevos tipos de normalización sin modificar existentes
 */

/**
 * Normaliza un valor numérico o texto de tipo de origen a su valor ENUM correspondiente
 * Convierte valores de la base de datos (números) a valores del dominio (ENUM)
 *
 * @param {number|string} value - Valor numérico (0, 1, 2) o texto del ENUM
 * @returns {string} Valor del ENUM: 'BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD'
 *
 * @example
 * normalizeOriginType(0) // 'BOLIVIANA'
 * normalizeOriginType(1) // 'EXTRANJERA'
 * normalizeOriginType(2) // 'DOBLE_NACIONALIDAD'
 * normalizeOriginType('BOLIVIANA') // 'BOLIVIANA'
 * normalizeOriginType('boliviana') // 'BOLIVIANA'
 * normalizeOriginType(null) // 'BOLIVIANA' (valor por defecto)
 */
export function normalizeOriginType(value) {
  // Si es null o undefined, retornar valor por defecto
  if (value === null || value === undefined) {
    return TIPOS_ORIGEN.BOLIVIANA;
  }

  // Si ya es un valor válido del ENUM, retornarlo directamente
  if (TIPOS_ORIGEN_VALUES.includes(String(value).toUpperCase())) {
    return String(value).toUpperCase();
  }

  // Convertir a número si es string, manejar espacios y otros casos
  let numericValue;
  if (typeof value === 'string') {
    // Limpiar espacios y convertir
    const cleaned = value.trim();
    numericValue = parseInt(cleaned, 10);
    // Si parseInt falla (devuelve NaN), intentar comparar directamente
    if (Number.isNaN(Number(numericValue))) {
      // Si no es un número válido, retornar por defecto
      return TIPOS_ORIGEN.BOLIVIANA;
    }
  } else {
    numericValue = Number(value);
    // Si no es un número válido, retornar por defecto
    if (Number.isNaN(Number(numericValue))) {
      return TIPOS_ORIGEN.BOLIVIANA;
    }
  }

  // Mapear valores numéricos a ENUM
  switch (numericValue) {
    case 0:
      return TIPOS_ORIGEN.BOLIVIANA;
    case 1:
      return TIPOS_ORIGEN.EXTRANJERA;
    case 2:
      return TIPOS_ORIGEN.DOBLE_NACIONALIDAD;
    default:
      return TIPOS_ORIGEN.BOLIVIANA; // Valor por defecto si no coincide
  }
}
