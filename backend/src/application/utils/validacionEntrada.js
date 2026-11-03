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

/**
 * Filtro por id de un query string: vacío ⇒ `undefined` (sin filtro); cualquier otro valor debe ser
 * un entero positivo (`'abc'`, `'5x'`, `0`, `-1` ⇒ ValidationError en lugar de `NaN` al repositorio).
 * @returns {number|undefined}
 */
export function parseFiltroId(value, nombre = 'id') {
  return esVacio(value) ? undefined : parseIdPositivo(value, nombre);
}

/**
 * Página y límite para listados tolerantes (contrato de `BaseListUseCase`): lo inválido, decimal o
 * menor que 1 cae al valor por defecto y el límite se acota a `maxLimit`; nunca produce
 * `totalPages` negativo ni `NaN`.
 * @returns {{page: number, limit: number}}
 */
export function normalizarPaginacionLista(page, limit, { defaultLimit = 50, maxLimit = 10000 } = {}) {
  const entero = (valor, defecto, max) => {
    const n = typeof valor === 'number' ? valor : /^\d+$/.test(String(valor).trim()) ? Number(valor) : NaN;
    if (!Number.isInteger(n) || n < 1) return defecto;
    return Math.min(n, max);
  };
  return {
    page: entero(page, 1, Number.MAX_SAFE_INTEGER),
    limit: entero(limit, defaultLimit, maxLimit),
  };
}

/**
 * Año y mes calendario de un filtro; vacíos toman el valor por defecto. Año 2000-2100, mes 1-12.
 * @returns {{anio: number, mes: number}}
 */
export function parseAnioMes({ anio, mes } = {}, { anioDefecto, mesDefecto } = {}) {
  return {
    anio: esVacio(anio) ? anioDefecto : parseNumero(anio, 'anio', { min: 2000, max: 2100, entero: true }),
    mes: esVacio(mes) ? mesDefecto : parseNumero(mes, 'mes', { min: 1, max: 12, entero: true }),
  };
}

/**
 * Primer valor definido (`!== undefined`) entre varias claves/alias del body. A diferencia de `??`
 * conserva `null`, de modo que un PATCH puede vaciar un campo enviando `null`.
 * @returns {*} `undefined` si ninguna clave viene en el body
 */
export function primerDefinido(origen, ...claves) {
  for (const clave of claves) {
    if (origen?.[clave] !== undefined) return origen[clave];
  }
  return undefined;
}

/**
 * Número opcional para PATCH: `undefined` ⇒ no tocar; `null` o `''` ⇒ `null` (vaciar);
 * cualquier otro valor se valida con `parseNumero`.
 * @returns {number|null|undefined}
 */
export function parseNumeroOpcional(value, nombre = 'valor', opciones = {}) {
  if (value === undefined) return undefined;
  if (esVacio(value)) return null;
  return parseNumero(value, nombre, opciones);
}

/**
 * Booleano opcional: `undefined` y `null` ⇒ `undefined` (no tocar / valor por defecto);
 * cualquier otro valor se valida con `parseBooleano`.
 * @returns {boolean|undefined}
 */
export function parseBooleanoOpcional(value, nombre = 'valor') {
  return value === undefined || value === null ? undefined : parseBooleano(value, nombre);
}

/**
 * Texto opcional: `undefined` ⇒ `undefined`; `null` ⇒ `null` (vaciar, salvo `requerido`);
 * otro valor ⇒ `String(...).trim()`; si es requerido no puede quedar vacío; respeta `max`.
 * @returns {string|null|undefined}
 */
export function parseTextoOpcional(value, nombre = 'valor', { max = Infinity, requerido = false } = {}) {
  if (value === undefined) return undefined;
  if (value === null) {
    if (requerido) throw new ValidationError(`${nombre} es requerido`);
    return null;
  }
  if (typeof value === 'object') throw new ValidationError(`${nombre} debe ser texto`);
  const texto = String(value).trim();
  if (requerido && texto === '') throw new ValidationError(`${nombre} es requerido`);
  if (texto.length > max) throw new ValidationError(`${nombre} no puede superar ${max} caracteres`);
  return texto;
}

/**
 * Lectura tolerante de una columna id (filas de BD/vistas): entero positivo o `null`.
 * `null`/`undefined`/`''`/`0`/`NaN` => `null` (no se convierten en 0). No lanza.
 * @returns {number|null}
 */
export function idONull(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 ? n : null;
}

/**
 * Año calendario entero (2000-2100). Rechaza '', null, 'abc', decimales y fuera de rango.
 * @returns {number}
 */
export function parseAnio(value, nombre = 'anio') {
  try {
    return parseNumero(value, nombre, { min: 2000, max: 2100, entero: true });
  } catch {
    throw new ValidationError(`${nombre} debe ser un año válido`);
  }
}
