/**
 * Redacción de datos sensibles para logs.
 *
 * Reemplaza por `[REDACTED]` el valor de toda propiedad cuyo nombre indique un secreto
 * (contraseñas, tokens, cabeceras de autenticación, etc.), a cualquier profundidad.
 * No muta el objeto original: devuelve una copia.
 */

const SENSITIVE_KEY = /pass(word|wd)?|contrase|clave|secret|token|authorization|cookie|api[-_]?key|credential|jwt|pin$/i;

export const REDACTED = '[REDACTED]';

const MAX_DEPTH = 8;

const isPlainObject = (value) => {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * @param {*} value - Valor a sanear (objeto, array o primitivo)
 * @param {WeakSet} [seen] - Control de referencias circulares
 * @param {number} [depth] - Profundidad actual
 * @returns {*} Copia saneada
 */
export function redactSensitive(value, seen = new WeakSet(), depth = 0) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  if (depth >= MAX_DEPTH) return '[MaxDepth]';

  if (Array.isArray(value)) {
    seen.add(value);
    return value.map((item) => redactSensitive(item, seen, depth + 1));
  }

  // Error, Date, Buffer, etc.: se dejan tal cual (no son datos de formulario)
  if (!isPlainObject(value)) return value;

  seen.add(value);
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? REDACTED : redactSensitive(item, seen, depth + 1);
  }
  return result;
}

export default redactSensitive;
