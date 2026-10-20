/**
 * Utilidades genéricas para operaciones de mapeo
 *
 * Rol: lo que un mapper de aplicación no puede resolver solo con BaseMapper (campo a campo).
 * - parseJsonArray: columnas JSON de vistas (apoderados, origenes, discapacidades) → array
 * - mapRows: array de filas + función (row → objeto) → array mapeado sin nulos
 * - normalizeId: IDs string/number para comparaciones
 * - createMap: array → mapa clave-valor normalizado
 *
 * Los mappers de vista (ContributionPaymentMapper, StudentPersonalDataMapper,
 * StudentDocumentDeliveryViewMapper) usan application/mappers/base/BaseMapper para
 * el mapeo campo a campo y mapUtils para lo anterior.
 *
 * Ubicación: domain/utils (funciones puras sin dependencias)
 */

/**
 * Parsea un valor a array de forma segura (vistas/BD pueden devolver JSON string o ya array).
 * Útil para columnas JSON de vistas (apoderados, origenes, discapacidades, etc.).
 *
 * @param {string|Array|null|undefined} raw - Valor crudo de la columna (string JSON o array)
 * @returns {Array} Array parseado o vacío si no es válido
 *
 * @example
 * parseJsonArray('[{"id":1}]') // [{ id: 1 }]
 * parseJsonArray([{ id: 1 }])  // [{ id: 1 }]
 * parseJsonArray(null)        // []
 */
export function parseJsonArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw == null || raw === '') return [];
  // MySQL/driver puede devolver JSON como string o Buffer
  let str = raw;
  if (typeof str !== 'string') {
    if (typeof str?.toString === 'function') str = str.toString();
    else return [];
  }
  if (typeof str !== 'string') return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
 * Mapea un array de filas con una función y filtra nulos.
 * Útil para vistas que devuelven arrays: mapear cada fila a formato API y descartar fallos.
 *
 * @param {Array} rows - Array de filas (p. ej. resultado de una vista)
 * @param {Function} mapper - Función (row) => objeto|null por fila
 * @returns {Array} Array de objetos mapeados (sin nulos)
 *
 * @example
 * const rows = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
 * mapRows(rows, (row) => ({ id: row.id, label: row.name })); // [{ id: 1, label: 'A' }, ...]
 */
export function mapRows(rows, mapper) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(mapper).filter((item) => item !== null);
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
    return Number.isNaN(Number(parsed)) ? null : parsed;
  }
  return null;
}
