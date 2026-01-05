/**
 * formFieldOptionMappers - Mappers para transformar datos del contexto a opciones de campos de formulario
 * 
 * Single Responsibility: Transformar datos del contexto en formato de opciones para campos de formulario (selects/radios)
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades de transformación de datos específicas para campos de formulario
 * - Separado por responsabilidad (cada mapper tiene su función específica)
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada mapper transforma un tipo específico de datos a opciones de formulario
 * - Open/Closed: Fácil de extender agregando nuevos mappers sin modificar existentes
 * 
 * Uso exclusivo: Campos de formulario (FormField component)
 */

/**
 * Mapea datos genéricos con estructura { id, nombre } o array de strings a opciones
 * @param {Array} data - Array de datos a mapear
 * @returns {Array} Array de opciones con formato { label, value }
 */
const mapGenericOptions = (data) => {
  return data.map(item => ({
    label: item.nombre || item.label || item,
    value: item.id || item.value || item,
  }));
};

/**
 * Mapea datos con estructura { label, value } a opciones
 * @param {Array} data - Array de objetos { label, value }
 * @returns {Array} Array de opciones con formato { label, value }
 */
const mapLabelValueOptions = (data) => {
  return data.map(item => ({
    label: item.label || item,
    value: item.value || item,
  }));
};

/**
 * Factory de mappers para opciones de campos de formulario
 * Centraliza la lógica de mapeo según el tipo de opción para campos de formulario
 * 
 * SOLID:
 * - Single Responsibility: Cada mapper tiene una responsabilidad específica (transformar a opciones de formulario)
 * - Open/Closed: Fácil de extender agregando nuevos mappers sin modificar existentes
 * - Strategy Pattern: Diferentes estrategias de mapeo según el tipo de datos
 */
export const formFieldOptionMappers = {
  // Mappers genéricos (para datos con estructura { id, nombre })
  expediciones: mapGenericOptions,
  generos: mapGenericOptions,
  paises: mapGenericOptions,
  idiomas: mapGenericOptions,
  estadosCiviles: mapGenericOptions,
  tiposSangre: mapGenericOptions,
  discapacidades: mapGenericOptions,
  departamentos: mapGenericOptions,
  provincias: mapGenericOptions,
  municipios: mapGenericOptions,
  
  // Mappers para datos con estructura { label, value }
  gradosDiscapacidad: mapLabelValueOptions,
  tiposOrigen: mapLabelValueOptions,
};

/**
 * Transforma datos del contexto en opciones de campos de formulario
 * 
 * @param {string} key - Clave del tipo de opción (ej: 'idiomas', 'generos', 'paisesExtranjeros')
 * @param {*} data - Datos a transformar
 * @returns {Array} Array de opciones con formato { label, value } para campos de formulario
 */
export const transformToOptions = (key, data) => {
  // Caso especial: paisesExtranjeros (países sin Bolivia)
  // Se necesita pasar todos los países para filtrar
  if (key === 'paisesExtranjeros') {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    const paisesSinBolivia = data.filter(pais => {
      // Filtrar Bolivia por codigo_iso o nombre
      const codigoIso = pais.codigo_iso || pais.codigoIso || '';
      const nombre = pais.nombre || '';
      return codigoIso.toUpperCase() !== 'BOL' && nombre.toUpperCase() !== 'BOLIVIA';
    });
    return mapGenericOptions(paisesSinBolivia);
  }

  const mapper = formFieldOptionMappers[key];
  
  if (!mapper) {
    console.warn(`[formFieldOptionMappers] No mapper found for key: ${key}`);
    return [];
  }
  
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return mapper(data);
};

