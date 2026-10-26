/**
 * Payloads de inyección (SQL, NoSQL, XSS, path traversal, null bytes) contra los validators y los
 * parámetros de ruta/query reales. Auth y permisos van simulados (acceso concedido) para llegar a
 * los validators; el use case jamás debe ejecutarse con un payload hostil: se exige 4xx, nunca 5xx.
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import app from '../../../src/app.js';
import container from '../../../src/infrastructure/container/index.js';
import { REPOSITORIOS_TOKENS } from '../../../src/infrastructure/container/tokens/index.js';
import { idValidator } from '../../../src/presentation/validators/common/id.validator.js';
import { listValidator } from '../../../src/presentation/validators/common/list.validator.js';
import { createValidateRequest } from '../../../src/presentation/middleware/validation.middleware.js';

const SQLI = [
  "1 OR 1=1",
  "1; DROP TABLE usuarios;--",
  "' OR '1'='1",
  "1' UNION SELECT username, password FROM usuarios--",
  "1/**/AND/**/SLEEP(5)",
  "1 AND (SELECT COUNT(*) FROM information_schema.tables)>0",
  "0x31",
  "1e0",
  "-1",
  "0",
  "1.5",
  "９",
  "",
  " ",
];
const XSS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<svg/onload=alert(1)>',
];
const TRAVERSAL = ['../../etc/passwd', '..%2f..%2fetc%2fpasswd', '%2e%2e/%2e%2e/etc/passwd', '..\\..\\windows\\win.ini', '%00', 'a%00b'];

/** Nunca debe responder 5xx ni aceptar el id hostil como válido. */
const ES_RECHAZO = (status) => status >= 400 && status < 500;

describe('Parámetros de ruta :id en rutas reales', () => {
  let repo;
  beforeEach(() => {
    repo = container.resolve(REPOSITORIOS_TOKENS.authRepository);
    jest.spyOn(repo, 'findSesionActiva').mockResolvedValue({
      usuario_id: 1,
      username: 'admin',
      rol_id: 1,
      rol_codigo: 'ADMIN_SISTEMA',
      usuario_estado: null,
    });
    jest.spyOn(repo, 'tienePermiso').mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  const token = () => jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const get = (ruta) => request(app).get(ruta).set('Authorization', `Bearer ${token()}`);

  it.each([
    '/api/v1/carreras',
    '/api/v1/materias',
    '/api/v1/usuarios',
    '/api/v1/roles',
    '/api/v1/docentes',
  ])('%s/:id rechaza ids no enteros positivos (SQLi, hex, decimales, vacíos) con 4xx', async (base) => {
    for (const payload of SQLI.filter((p) => p.trim() !== '' && !/^\d+$/.test(p))) {
      const res = await get(`${base}/${encodeURIComponent(payload)}`);
      expect({ payload, ok: ES_RECHAZO(res.status) }).toEqual({ payload, ok: true });
    }
  });

  it.each(TRAVERSAL)('path traversal "%s" como :id -> 4xx y sin exponer archivos', async (payload) => {
    const res = await get(`/api/v1/carreras/${payload}`);
    expect(ES_RECHAZO(res.status)).toBe(true);
    expect(res.text).not.toMatch(/root:.*:0:0|\[fonts\]/);
  });

  it('query de listado hostil (page/limit/search como SQLi) -> 4xx, no 5xx', async () => {
    for (const q of [
      'page=1;DROP TABLE x',
      "page=1 OR 1=1",
      "limit=10000000000",
      "limit=-1",
      "limit=1 UNION SELECT 1",
      "page=0",
    ]) {
      const res = await get(`/api/v1/carreras?${q}`);
      expect({ q, status: res.status }).toEqual({ q, status: expect.any(Number) });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    }
  });

  it('NoSQL en query (search[$ne]=, search[$gt]=) no provoca 5xx', async () => {
    for (const q of ['search[$ne]=x', 'search[$gt]=', 'page[$gt]=0', 'limit[$ne]=1']) {
      const res = await get(`/api/v1/carreras?${q}`);
      expect({ q, ok: res.status < 500 }).toEqual({ q, ok: true });
    }
  });
});

describe('Cuerpo del login con payloads NoSQL/SQL/XSS', () => {
  const login = (body) => request(app).post('/api/v1/auth/login').send(body);

  it.each([
    [{ username: { $ne: null }, password: { $ne: null } }],
    [{ username: { $gt: '' }, password: 'Cualquiera-1234' }],
    [{ username: ['a', 'b'], password: 'Cualquiera-1234' }],
    [{ username: 'a', password: ['x', 'y'] }],
    [{ username: 'a'.repeat(51), password: 'Cualquiera-1234' }],
    [{ username: 'admin', password: 'x'.repeat(101) }],
    [{ username: 'admin', password: 'corta' }],
    [{}],
    [{ username: null, password: null }],
  ])('%j -> 4xx (validación) sin llegar a la BD', async (body) => {
    const res = await login(body);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('JSON con __proto__ / constructor no contamina Object.prototype', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"__proto__":{"polluted":"si"},"constructor":{"prototype":{"polluted":"si"}},"username":"a"}');
    expect({}.polluted).toBeUndefined();
  });

  it.each(XSS)('XSS "%s" en username: respuesta JSON con nosniff, jamás HTML', async (payload) => {
    const res = await login({ username: payload, password: 'corta' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.status).toBeLessThan(500);
  });
});

describe('Reflexión en 404', () => {
  it.each(XSS)('la URL con "%s" se devuelve como JSON (no text/html)', async (payload) => {
    const res = await request(app).get(`/api/v1/${encodeURIComponent(payload)}`);
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-type']).not.toMatch(/html/);
  });
});

describe('Validators comunes aislados (idValidator, listValidator)', () => {
  const validateRequest = createValidateRequest({ warn: () => {} });
  const montar = (validator) => {
    const mini = express();
    mini.get('/x/:id', validator, validateRequest, (req, res) => res.json({ id: req.params.id }));
    mini.use((err, req, res, _next) => res.status(err.statusCode || 500).json({ error: err.message }));
    return mini;
  };

  it('idValidator acepta solo enteros positivos', async () => {
    const mini = montar(idValidator);
    expect((await request(mini).get('/x/42')).status).toBe(200);
    for (const bad of SQLI.filter((p) => p.trim() !== '' && !/^[1-9]\d*$/.test(p) && p !== '９')) {
      const res = await request(mini).get(`/x/${encodeURIComponent(bad)}`);
      expect({ bad, status: res.status }).toEqual({ bad, status: 400 });
    }
  });

  it('listValidator acota page/limit/search', async () => {
    const mini = express();
    mini.get('/l', listValidator, validateRequest, (req, res) => res.json({ ok: true }));
    mini.use((err, req, res, _next) => res.status(err.statusCode || 500).json({}));
    expect((await request(mini).get('/l?page=1&limit=20&search=ana')).status).toBe(200);
    expect((await request(mini).get('/l?limit=10001')).status).toBe(400);
    expect((await request(mini).get('/l?page=-1')).status).toBe(400);
    expect((await request(mini).get(`/l?search=${'a'.repeat(101)}`)).status).toBe(400);
    expect((await request(mini).get('/l?page=1;DROP TABLE x')).status).toBe(400);
  });
});
