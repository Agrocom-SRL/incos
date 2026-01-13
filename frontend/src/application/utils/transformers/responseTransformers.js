/**
 * responseTransformers - Transformadores para normalizar estructuras de respuesta del backend
 * 
 * Single Responsibility: Normalizar estructuras de datos del backend (objeto → array, etc.)
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas de transformación compartidas entre módulos
 * - Funciones puras sin dependencias de módulos específicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada función normaliza un tipo específico de estructura
 * - Open/Closed: Extensible agregando nuevos transformadores sin modificar existentes
 * - Dependency Inversion: No depende de implementaciones concretas de módulos
 * 
 * Uso: Normalizar respuestas del backend antes de aplicar mappers específicos
 * 
 * Esta función es genérica y reutilizable en cualquier módulo que necesite normalizar
 * respuestas del backend que pueden retornar un objeto único o un array.
 * 
 * Ejemplo:
 * ```javascript
 * import { normalizeFieldToArray } from '@application/utils';
 * 
 * // Búsqueda de estudiantes
 * const backendResponse = { student: { id: 1, nombre: 'Juan' } };
 * const normalized = normalizeFieldToArray(backendResponse, 'student');
 * // Resultado: [{ id: 1, nombre: 'Juan' }]
 * 
 * // Búsqueda de carreras
 * const carreraResponse = { career: [{ id: 1 }, { id: 2 }] };
 * const carreras = normalizeFieldToArray(carreraResponse, 'career');
 * // Resultado: [{ id: 1 }, { id: 2 }]
 * ```
 */

/**
 * Normaliza un campo de respuesta del backend a un array consistente
 * Convierte { fieldName: {...} } o { fieldName: [...] } a un array siempre
 * 
 * El backend puede retornar estructuras inconsistentes:
 * - { fieldName: {...} } → Un solo resultado (objeto único)
 * - { fieldName: [...] } → Múltiples resultados (array)
 * 
 * Esta función normaliza ambos casos a un array consistente, facilitando
 * el procesamiento posterior con mappers específicos del módulo.
 * 
 * @param {Object} resultData - Datos de la respuesta del backend
 * @param {string} fieldName - Nombre del campo que contiene los datos (ej: 'student', 'career', 'subject')
 * @returns {Array} Array normalizado (siempre un array, incluso si había un solo objeto)
 * 
 * @example
 * // Caso 1: Objeto único (búsqueda que retorna un solo resultado)
 * normalizeFieldToArray({ student: { id: 1, nombre: 'Juan' } }, 'student')
 * // Retorna: [{ id: 1, nombre: 'Juan' }]
 * 
 * // Caso 2: Array (búsqueda que retorna múltiples resultados)
 * normalizeFieldToArray({ student: [{ id: 1 }, { id: 2 }] }, 'student')
 * // Retorna: [{ id: 1 }, { id: 2 }]
 * 
 * // Caso 3: Ya es array directo
 * normalizeFieldToArray([{ id: 1 }], 'student')
 * // Retorna: [{ id: 1 }]
 * 
 * // Caso 4: Uso en otros módulos (carreras, materias, etc.)
 * normalizeFieldToArray({ career: { id: 1, nombre: 'Ingeniería' } }, 'career')
 * // Retorna: [{ id: 1, nombre: 'Ingeniería' }]
 */
export const normalizeFieldToArray = (resultData, fieldName = 'student') => {
  if (!resultData) {
    return [];
  }

  // Si el backend retorna { fieldName: {...} }, extraerlo y convertir a array
  if (resultData[fieldName]) {
    return Array.isArray(resultData[fieldName]) 
      ? resultData[fieldName] 
      : [resultData[fieldName]];
  }

  // Si ya es un array, retornarlo directamente
  if (Array.isArray(resultData)) {
    return resultData;
  }

  // Si no hay datos reconocibles, retornar array vacío
  return [];
};
