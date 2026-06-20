/**
 * translate(dict, key, vars) — resuelve una clave punteada con interpolación.
 * Función PURA (sin React): facilita testeo y reutilización.
 *
 * @example translate(es, 'common.showing', { from: 1, to: 10, total: 50 })
 */
export function translate(dict, key, vars) {
  const raw = key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
  if (typeof raw !== 'string') return key; // fallback visible: muestra la clave faltante
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

export default translate;
