/**
 * optionTransformers - Transformadores genéricos para convertir datos a opciones de formulario
 * 
 * Single Responsibility: Transformar datos de diferentes estructuras a formato de opciones { label, value }
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas de transformación compartidas entre módulos
 * - Funciones puras sin dependencias de módulos específicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada función transforma un tipo específico de datos
 * - Open/Closed: Extensible agregando nuevos transformadores sin modificar existentes
 * - Dependency Inversion: No depende de implementaciones concretas de módulos
 * 
 * Uso: Cualquier módulo que necesite transformar datos a opciones de formulario
 * 
 * Ejemplo:
 * ```javascript
 * import { mapGenericOptions, transformToOptions } from '@application/utils';
 * 
 * const paises = [{ id: 1, nombre: 'Bolivia' }, { id: 2, nombre: 'Perú' }];
 * const opciones = mapGenericOptions(paises);
 * // Resultado: [{ label: 'Bolivia', value: 1 }, { label: 'Perú', value: 2 }]
 * ```
 */

/**
 * Mapea datos genéricos con estructura { id, nombre } o array de strings a opciones
 * 
 * Soporta múltiples formatos de entrada:
 * - { id, nombre }
 * - { id, label }
 * - { value, label }
 * - string (se usa como label y value)
 * 
 * @param {Array} data - Array de datos a mapear
 * @returns {Array} Array de opciones con formato { label, value }
 */
export const mapGenericOptions = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(item => {
    // Si es un string, usarlo como label y value
    if (typeof item === 'string') {
      return { label: item, value: item };
    }

    // Si es un objeto, extraer label y value
    return {
      label: item.nombre || item.label || item.name || String(item),
      value: item.id || item.value || item.code || item,
    };
  });
};

/**
 * Mapea datos con estructura { label, value } a opciones
 * 
 * Útil para datos que ya vienen en formato de opciones pero pueden necesitar normalización
 * 
 * @param {Array} data - Array de objetos { label, value }
 * @returns {Array} Array de opciones con formato { label, value }
 */
export const mapLabelValueOptions = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(item => {
    // Si es un string, usarlo como label y value
    if (typeof item === 'string') {
      return { label: item, value: item };
    }

    // Si es un objeto, extraer label y value
    return {
      label: item.label || item.nombre || item.name || String(item),
      value: item.value || item.id || item.code || item,
    };
  });
};

/**
 * Transforma datos del contexto en opciones de campos de formulario
 * 
 * Función genérica que acepta un mapper y opcionalmente un filtro
 * 
 * @param {string} mapperType - Tipo de mapper a usar ('generic' | 'labelValue')
 * @param {Array} data - Datos a transformar
 * @param {Function} [filterFn] - Función opcional para filtrar datos antes de transformar
 * @returns {Array} Array de opciones con formato { label, value }
 * 
 * @example
 * // Uso básico
 * transformToOptions('generic', paises);
 * 
 * // Con filtro
 * transformToOptions('generic', paises, (pais) => pais.codigo_iso !== 'BOL');
 */
export const transformToOptions = (mapperType, data, filterFn = null) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Aplicar filtro si existe
  let filteredData = data;
  if (filterFn && typeof filterFn === 'function') {
    filteredData = data.filter(filterFn);
  }

  // Seleccionar mapper según tipo
  const mapper = mapperType === 'labelValue' ? mapLabelValueOptions : mapGenericOptions;
  
  return mapper(filteredData);
};

/**
 * Factory de mappers predefinidos para casos comunes
 * 
 * Permite registrar mappers personalizados por tipo de dato
 * Útil cuando se necesita un comportamiento específico para ciertos tipos
 * 
 * @example
 * const customMappers = {
 *   paises: (data) => mapGenericOptions(data),
 *   paisesExtranjeros: (data) => transformToOptions('generic', data, (p) => p.codigo_iso !== 'BOL')
 * };
 * 
 * const opciones = customMappers.paisesExtranjeros(paises);
 */
export const createOptionMapper = (mapperType, filterFn = null) => {
  return (data) => transformToOptions(mapperType, data, filterFn);
};

