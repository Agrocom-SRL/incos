/**
 * filters - Filtros genéricos para transformación de datos
 * 
 * Single Responsibility: Proporcionar funciones de filtrado reutilizables
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas de filtrado compartidas entre módulos
 * - Funciones puras sin dependencias de módulos específicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada filtro tiene una responsabilidad específica
 * - Open/Closed: Extensible agregando nuevos filtros sin modificar existentes
 * 
 * Uso: Combinar con optionTransformers para filtrar datos antes de transformarlos
 * 
 * Ejemplo:
 * ```javascript
 * import { transformToOptions } from '@application/utils';
 * import { excludeByField } from '@application/utils/transformers/filters';
 * 
 * const paisesExtranjeros = transformToOptions(
 *   'generic',
 *   paises,
 *   excludeByField('codigo_iso', 'BOL')
 * );
 * ```
 */

/**
 * Crea un filtro que excluye items donde un campo coincide con un valor
 * 
 * @param {string} fieldName - Nombre del campo a verificar
 * @param {string|number|boolean} excludeValue - Valor a excluir
 * @param {boolean} caseSensitive - Si es false, hace comparación case-insensitive (default: false)
 * @returns {Function} Función de filtro
 * 
 * @example
 * const sinBolivia = excludeByField('codigo_iso', 'BOL');
 * const paisesFiltrados = paises.filter(sinBolivia);
 */
export const excludeByField = (fieldName, excludeValue, caseSensitive = false) => {
  return (item) => {
    if (!item || typeof item !== 'object') {
      return true;
    }

    const fieldValue = item[fieldName];
    
    if (caseSensitive) {
      return fieldValue !== excludeValue;
    }

    // Comparación case-insensitive para strings
    if (typeof fieldValue === 'string' && typeof excludeValue === 'string') {
      return fieldValue.toUpperCase() !== excludeValue.toUpperCase();
    }

    return fieldValue !== excludeValue;
  };
};

/**
 * Crea un filtro que excluye items donde múltiples campos coinciden con valores
 * 
 * Útil cuando necesitas excluir por múltiples criterios (ej: código ISO o nombre)
 * 
 * @param {Array<{field: string, value: any}>} excludeRules - Array de reglas de exclusión
 * @param {boolean} caseSensitive - Si es false, hace comparación case-insensitive (default: false)
 * @returns {Function} Función de filtro
 * 
 * @example
 * const sinBolivia = excludeByMultipleFields([
 *   { field: 'codigo_iso', value: 'BOL' },
 *   { field: 'nombre', value: 'Bolivia' }
 * ]);
 */
export const excludeByMultipleFields = (excludeRules, caseSensitive = false) => {
  return (item) => {
    if (!item || typeof item !== 'object') {
      return true;
    }

    // Si alguno de los campos coincide, excluir el item
    return !excludeRules.some(rule => {
      const fieldValue = item[rule.field];
      
      if (caseSensitive) {
        return fieldValue === rule.value;
      }

      // Comparación case-insensitive para strings
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue.toUpperCase() === rule.value.toUpperCase();
      }

      return fieldValue === rule.value;
    });
  };
};

/**
 * Crea un filtro que incluye solo items donde un campo coincide con un valor
 * 
 * @param {string} fieldName - Nombre del campo a verificar
 * @param {string|number|boolean} includeValue - Valor a incluir
 * @param {boolean} caseSensitive - Si es false, hace comparación case-insensitive (default: false)
 * @returns {Function} Función de filtro
 */
export const includeByField = (fieldName, includeValue, caseSensitive = false) => {
  return (item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const fieldValue = item[fieldName];
    
    if (caseSensitive) {
      return fieldValue === includeValue;
    }

    // Comparación case-insensitive para strings
    if (typeof fieldValue === 'string' && typeof includeValue === 'string') {
      return fieldValue.toUpperCase() === includeValue.toUpperCase();
    }

    return fieldValue === includeValue;
  };
};

