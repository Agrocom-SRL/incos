/**
 * Utilidades genéricas para operaciones de mapeo
 * 
 * Responsabilidades:
 * - Crear mapas de clave-valor desde arrays u objetos
 * - Normalizar claves (IDs) para evitar problemas de tipo (number vs string)
 * - Operaciones genéricas reutilizables sin dependencias externas
 * 
 * Ubicación: domain/utils (capa de dominio - funciones puras sin dependencias)
 * 
 * NOTA: Funciones puras sin dependencias externas, por lo que están en Domain según Clean Architecture
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo operaciones de mapeo genéricas
 * - Open/Closed: Extensible para nuevos tipos de mapeo sin modificar existentes
 */

/**
 * Crea un mapa normalizado de clave-valor desde un array de objetos
 * Normaliza claves tanto como número como string para compatibilidad
 * 
 * @param {Array} source - Array de objetos: [{ id: 1, name: 'Doc 1' }, { id: 2, name: 'Doc 2' }]
 * @param {string} keyField - Nombre del campo que será la clave (requerido, ej: 'id', 'code', 'title')
 * @param {string} valueField - Nombre del campo que será el valor (requerido, ej: 'name', 'title', 'description')
 * @returns {Object} Mapa normalizado { [clave]: valor, [String(clave)]: valor }
 * 
 * @example
 * // Mapa id -> name
 * const documents = [{ id: 1, name: 'Diploma' }, { id: 2, name: 'CI' }];
 * const map = createMap(documents, 'id', 'name');
 * // Resultado: { 1: 'Diploma', '1': 'Diploma', 2: 'CI', '2': 'CI' }
 * 
 * @example
 * // Mapa code -> title
 * const items = [{ code: 'A01', title: 'Item A' }, { code: 'B02', title: 'Item B' }];
 * const map = createMap(items, 'code', 'title');
 * // Resultado: { 'A01': 'Item A', 'B02': 'Item B' }
 */
export function createMap(source, keyField, valueField) {
  if (!Array.isArray(source)) {
    return {};
  }

  if (!keyField || !valueField) {
    throw new Error('keyField y valueField son requeridos');
  }

  const map = {};
  
  source.forEach((item) => {
    const key = item[keyField];
    const value = item[valueField];
    
    if (key !== null && key !== undefined && value !== null && value !== undefined) {
      const normalizedKey = normalizeId(key);
      
      // Si la clave es numérica, normalizar y crear ambas versiones
      if (normalizedKey !== null && typeof key !== 'string') {
        map[normalizedKey] = value;
        map[String(normalizedKey)] = value; // También como string para compatibilidad
      } else {
        // Si es string u otro tipo, solo crear una entrada
        map[key] = value;
      }
    }
  });

  return map;
}

/**
 * Normaliza un ID a número para comparaciones consistentes
 * Útil para normalizar claves numéricas (como IDs) desde strings
 * 
 * @param {number|string} id - ID a normalizar
 * @returns {number|null} ID normalizado como número o null si no es válido
 * 
 * @example
 * normalizeId(123) // 123
 * normalizeId('123') // 123
 * normalizeId('abc') // null
 * normalizeId(null) // null
 */
export function normalizeId(id) {
  if (id === null || id === undefined) return null;
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

