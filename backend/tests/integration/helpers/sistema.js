/**
 * Helpers de las pruebas de integración (BD real efímera cargada por scripts/ci-cargar-bd.sh).
 *
 * - `iniciarSistema()`: verifica la BD y falla con mensaje claro si no responde (no se cuelga).
 * - `tokenDe(rol)` / `como(rol)`: login real por rol (usuarios de database/04-test-seeds).
 * - `cerrarSistema()`: cierra el pool de Sequelize para que Jest termine limpio.
 */
import request from 'supertest';
import app from '../../../src/app.js';
import { sequelize } from '../../../src/infrastructure/database/sequelize.js';

export const PASSWORD_PRUEBA = 'Test-Incos-2026';

/** Rol sembrado en 02-seeders/55-seed-roles.sql -> username del seed de pruebas. */
export const USUARIOS = {
  ADMIN_SISTEMA: 'test.admin',
  RECTOR: 'test.rector',
  DIR_ACADEMICO: 'test.dir_academico',
  DIR_ADMIN: 'test.dir_admin',
  SEC_ACADEMICA: 'test.sec_academica',
  SEC_ADMIN: 'test.sec_admin',
  DOCENTE: 'test.docente',
  ESTUDIANTE: 'test.estudiante',
};

export const ROLES = Object.keys(USUARIOS);

const API = '/api/v1';
const TIMEOUT_BD_MS = 15000;
const cacheSesiones = new Map();

export { app, request, sequelize, API };

/** Conecta a la BD o falla con instrucciones claras (nunca queda colgado). */
export async function iniciarSistema() {
  const destino = `${process.env.DB_HOST || '(DB_HOST sin definir)'}:${process.env.DB_PORT || '(puerto por defecto)'}/${process.env.DB_NAME}`;
  let temporizador;
  const espera = new Promise((_, reject) => {
    temporizador = setTimeout(
      () => reject(new Error(`sin respuesta en ${TIMEOUT_BD_MS} ms`)),
      TIMEOUT_BD_MS
    );
  });
  try {
    await Promise.race([sequelize.authenticate(), espera]);
    const [filas] = await sequelize.query(
      "SELECT COUNT(*) AS n FROM usuarios WHERE username = 'test.admin'"
    );
    if (Number(filas[0].n) !== 1) {
      throw new Error('la BD no tiene el seed de pruebas (database/04-test-seeds)');
    }
  } catch (err) {
    throw new Error(
      `Pruebas de integración: no se pudo usar la BD ${destino} (${err.message}).\n` +
        'Cree una BD descartable *_test con "bash scripts/ci-cargar-bd.sh" y defina ' +
        'DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME. Ver docs/guias/pruebas.md.'
    );
  } finally {
    clearTimeout(temporizador);
  }
}

export async function cerrarSistema() {
  cacheSesiones.clear();
  await sequelize.close();
}

/** POST /auth/login real (sin caché). */
export function login(username, password = PASSWORD_PRUEBA) {
  return request(app).post(`${API}/auth/login`).send({ username, password });
}

/** Sesión (token + cuerpo del login) del usuario de prueba del rol; una sola vez por archivo. */
export async function sesionDe(rol) {
  if (!USUARIOS[rol]) throw new Error(`Rol de prueba desconocido: ${rol}`);
  if (!cacheSesiones.has(rol)) {
    const res = await login(USUARIOS[rol]);
    if (res.status !== 200) {
      throw new Error(`Login de ${rol} falló (${res.status}): ${JSON.stringify(res.body)}`);
    }
    cacheSesiones.set(rol, { token: res.body.data.token, ...res.body.data });
  }
  return cacheSesiones.get(rol);
}

export async function tokenDe(rol) {
  return (await sesionDe(rol)).token;
}

/** Petición autenticada: `await como('RECTOR', 'get', '/carreras')`. */
export async function como(rol, metodo, ruta) {
  const token = await tokenDe(rol);
  return request(app)[metodo](`${API}${ruta}`).set('Authorization', `Bearer ${token}`);
}

/** Binario (Excel/PDF) como Buffer en `res.body`. */
export async function descargarComo(rol, ruta) {
  const token = await tokenDe(rol);
  return request(app)
    .get(`${API}${ruta}`)
    .set('Authorization', `Bearer ${token}`)
    .buffer(true)
    .parse((res, cb) => {
      const trozos = [];
      res.on('data', (t) => trozos.push(t));
      res.on('end', () => cb(null, Buffer.concat(trozos)));
    });
}
