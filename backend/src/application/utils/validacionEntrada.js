import { ValidationError } from '../../domain/errors/AppError.js';

/**
 * Validadores estrictos de entrada para use cases.
 *
 * Evitan el patrón `Number('abc') = NaN` / `Number('') = 0` / `Boolean('false') = true`,
 * que dejaba pasar valores basura. Todos lanzan `ValidationError` con el nombre del campo.
 */

const esVacio = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/**
 * Entero positivo (>= 1). Rechaza '5abc', 1.5, 0, negativos, NaN y booleanos.
 * @returns {number}
 */
export function parseIdPositivo(value, nombre = 'id') {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 1) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const n = Number(value.trim());
    if (Number.isSafeInteger(n) && n >= 1) return n;
  }
  throw new ValidationError(`${nombre} debe ser un entero positivo`);
}

/**
 * Como `parseIdPositivo`, pero `undefined`, `null` y `''` devuelven `null`.
 * @returns {number|null}
 */
export function parseIdOpcional(value, nombre = 'id') {
  return esVacio(value) ? null : parseIdPositivo(value, nombre);
}

/**
 * Número finito dentro de un rango. `''`, espacios, `null`, booleanos e `Infinity` se rechazan
 * (no se convierten en 0). El 0 explícito es válido si `min <= 0`.
 * @param {*} value
 * @param {string} nombre
 * @param {{min?: number, max?: number, entero?: boolean}} [opciones]
 * @returns {number}
 */
export function parseNumero(value, nombre = 'valor', { min = -Infinity, max = Infinity, entero = false } = {}) {
  const valido = (typeof value === 'number') || (typeof value === 'string' && value.trim() !== '');
  const n = valido ? Number(value) : NaN;
  if (!Number.isFinite(n)) {
    throw new ValidationError(`${nombre} debe ser un número válido`);
  }
  if (entero && !Number.isInteger(n)) {
    throw new ValidationError(`${nombre} debe ser un número entero`);
  }
  if (n < min || n > max) {
    const rango = [
      Number.isFinite(min) ? `mayor o igual a ${min}` : null,
      Number.isFinite(max) ? `menor o igual a ${max}` : null,
    ].filter(Boolean).join(' y ');
    throw new ValidationError(`${nombre} debe ser ${rango}`);
  }
  return n;
}

/**
 * Fecha calendario real en formato `YYYY-MM-DD` (acepta un ISO completo y toma los 10 primeros
 * caracteres). Rechaza `2026-02-31`, `abc` y vacíos.
 * @returns {string}
 */
export function parseFechaISO(value, nombre = 'fecha') {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new ValidationError(`${nombre} no es una fecha válida`);
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${nombre} debe tener formato YYYY-MM-DD`);
  }
  const str = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!match) {
    throw new ValidationError(`${nombre} debe tener formato YYYY-MM-DD`);
  }
  const [anio, mes, dia] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (fecha.getUTCFullYear() !== anio || fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) {
    throw new ValidationError(`${nombre} no es una fecha válida`);
  }
  return str;
}

/**
 * Booleano estricto: `true/false`, `'true'/'false'`, `1/0`, `'1'/'0'`.
 * `undefined`, `null`, `''` y cualquier otro valor se rechazan (no se interpretan como false).
 * @returns {boolean}
 */
export function parseBooleano(value, nombre = 'valor') {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  throw new ValidationError(`${nombre} debe ser verdadero o falso`);
}

/**
 * Paginación acotada: `page >= 1`, `1 <= limit <= maxLimit`. Ausentes usan los valores por defecto.
 * @returns {{page: number, limit: number, offset: number}}
 */
export function parsePaginacion({ page, limit } = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const p = esVacio(page) ? 1 : parseNumero(page, 'page', { min: 1, entero: true });
  const l = esVacio(limit) ? defaultLimit : parseNumero(limit, 'limit', { min: 1, max: maxLimit, entero: true });
  return { page: p, limit: l, offset: (p - 1) * l };
}
