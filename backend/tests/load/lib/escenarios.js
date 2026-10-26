import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';
import { API, PASSWORD, USUARIOS, ROLES, LISTADOS, EXPORTACION, DASHBOARDS } from './config.js';

const duracionLogin = new Trend('incos_login_ms', true);
const duracionListado = new Trend('incos_listado_ms', true);
const duracionExport = new Trend('incos_export_ms', true);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function login(rol) {
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ username: USUARIOS[rol], password: PASSWORD }),
    { headers: JSON_HEADERS, tags: { endpoint: 'login' } }
  );
  duracionLogin.add(res.timings.duration);
  return res;
}

/** setup(): un login por rol; los VU reutilizan los tokens (el login hace bcrypt y satura la CPU). */
export function prepararSesiones() {
  const tokens = {};
  for (const rol of ROLES) {
    const res = login(rol);
    if (res.status !== 200) {
      throw new Error(
        `Login de ${rol} falló (${res.status}): ${res.body}. ¿BD con seed de pruebas y K6_PASSWORD correcta?`
      );
    }
    tokens[rol] = res.json('data.token');
  }
  return tokens;
}

function get(ruta, token, etiqueta, extra = {}) {
  return http.get(`${API}${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: etiqueta },
    ...extra,
  });
}

/** Login por rol (rol rotativo por iteración). */
export function escenarioLogin() {
  const rol = ROLES[(__VU + __ITER) % ROLES.length];
  const res = login(rol);
  check(res, {
    'login 200': (r) => r.status === 200,
    'login trae token': (r) => !!r.json('data.token'),
  });
}

export function escenarioMe(tokens) {
  const rol = ROLES[(__VU + __ITER) % ROLES.length];
  const res = get('/auth/me', tokens[rol], 'auth_me');
  check(res, { 'me 200': (r) => r.status === 200 });
}

export function escenarioDashboard(tokens) {
  const [ruta, rol] = DASHBOARDS[(__VU + __ITER) % DASHBOARDS.length];
  const res = get(ruta, tokens[rol], 'dashboard');
  check(res, { 'dashboard 200': (r) => r.status === 200 });
}

export function escenarioListados(tokens) {
  const [ruta, rol] = LISTADOS[(__VU + __ITER) % LISTADOS.length];
  const res = get(ruta, tokens[rol], `listado${ruta}`);
  duracionListado.add(res.timings.duration);
  check(res, {
    'listado 200': (r) => r.status === 200,
    'listado success': (r) => r.json('success') === true,
  });
}

export function escenarioExportacion(tokens) {
  const [ruta, rol] = EXPORTACION;
  const res = get(ruta, tokens[rol], 'exportacion', { responseType: 'binary' });
  duracionExport.add(res.timings.duration);
  check(res, {
    'export 200': (r) => r.status === 200,
    'export no vacío': (r) => r.body && r.body.byteLength > 1000,
  });
}

/**
 * Iteración de un usuario típico: /auth/me, dashboard y listados; de vez en cuando
 * login y exportación (más caros, por eso en menor proporción).
 */
export function iteracionMixta(tokens) {
  const n = __ITER % 10;
  group('sesion', () => escenarioMe(tokens));
  group('dashboard', () => escenarioDashboard(tokens));
  group('listados', () => {
    escenarioListados(tokens);
    escenarioListados(tokens);
  });
  if (n === 0) group('login', escenarioLogin);
  if (n === 5) group('exportacion', () => escenarioExportacion(tokens));
}
