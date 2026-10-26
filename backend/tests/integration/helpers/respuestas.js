/**
 * Aserciones de contrato compartidas por las pruebas de integración por dominio.
 *
 * - Validación (express-validator): 400 `{ success:false, error:{ code:'VALIDATION_ERROR', details[] } }`.
 * - No encontrado: 404 `{ success:false, error:{ code:'NOT_FOUND' } }`.
 * - Sin permiso (`verificarPermiso`): 403 `{ error:'Acceso denegado', codigo, accion }`.
 */
import { expect } from '@jest/globals';
import { como, tokenDe, request, app, API } from './sistema.js';

export function esperarValidacion(res, campo) {
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
  if (campo) {
    const campos = (res.body.error.details || []).map((d) => d.field);
    expect(campos).toContain(campo);
  }
}

export function esperarNoEncontrado(res) {
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
  expect(res.body.error.code).toBe('NOT_FOUND');
}

export function esperarDenegado(res, codigo, accion) {
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Acceso denegado');
  if (codigo) expect(res.body.codigo).toBe(codigo);
  if (accion) expect(res.body.accion).toBe(accion);
}

/** Listado paginado: `data` arreglo + `pagination { page, limit, total, totalPages }`. */
export function esperarListadoPaginado(res, { page = 1, limit } = {}) {
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.pagination.page).toBe(page);
  if (limit !== undefined) expect(res.body.pagination.limit).toBe(limit);
  expect(res.body.data.length).toBeLessThanOrEqual(res.body.pagination.limit);
  expect(res.body.pagination.total).toBeGreaterThanOrEqual(res.body.data.length);
}

/**
 * Ejecuta `fn` y, pase lo que pase, corre los pasos de limpieza registrados (en orden inverso).
 * `limpiar.push(async () => ...)`; los errores de limpieza no ocultan el fallo de la prueba.
 */
export async function conLimpieza(fn) {
  const limpiar = [];
  try {
    return await fn(limpiar);
  } finally {
    for (const paso of limpiar.reverse()) {
      try {
        await paso();
      } catch {
        // la limpieza es best-effort: el error real es el de la prueba
      }
    }
  }
}

/** Atajo: la misma petición para cada rol sin permiso, todas deben dar 403 del mismo permiso. */
export async function esperarDenegadoParaRoles(roles, metodo, ruta, codigo, accion) {
  for (const rol of roles) {
    const res = await como(rol, metodo, ruta);
    expect({ rol, status: res.status }).toEqual({ rol, status: 403 });
    esperarDenegado(res, codigo, accion);
  }
}

/** Petición con cuerpo JSON: `await enviarComo('RECTOR', 'post', '/ruta', { ... })`. */
export async function enviarComo(rol, metodo, ruta, cuerpo) {
  const token = await tokenDe(rol);
  const peticion = request(app)[metodo](`${API}${ruta}`).set('Authorization', `Bearer ${token}`);
  return cuerpo === undefined ? peticion : peticion.send(cuerpo);
}
