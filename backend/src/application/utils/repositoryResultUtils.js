/**
 * Normaliza el retorno de BaseRepository.findAll (objeto con colección) a array.
 * @param {unknown} result
 * @param {string[]} collectionKeys - nombres posibles de la colección
 * @returns {Array}
 */
export function unwrapRepositoryList(result, collectionKeys = []) {
  if (Array.isArray(result)) return result;
  for (const key of collectionKeys) {
    if (Array.isArray(result?.[key])) return result[key];
  }
  if (result && typeof result === 'object') {
    const found = Object.values(result).find((v) => Array.isArray(v));
    if (found) return found;
  }
  return [];
}
