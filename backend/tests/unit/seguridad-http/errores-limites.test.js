/**
 * No filtración de errores internos, límite de tamaño de body y 404/400 limpios. Sin BD.
 */
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import container from '../../../src/infrastructure/container/index.js';
import { REPOSITORIOS_TOKENS } from '../../../src/infrastructure/container/tokens/index.js';

const FILTRACIONES = [
  /at .*\(.*:\d+:\d+\)/, // línea de stack trace
  /node_modules/,
  /SequelizeDatabaseError|\bER_[A-Z_]+|SELECT .* FROM/,
  /[A-Za-z]:\\|\/home\/|\/src\//, // rutas del servidor
  /"stack"/,
];

function sinFiltraciones(res) {
  const texto = res.text || JSON.stringify(res.body);
  for (const patron of FILTRACIONES) expect(texto).not.toMatch(patron);
}

describe('Errores 500 no filtran detalles internos', () => {
  afterEach(() => jest.restoreAllMocks());

  it('un fallo inesperado (SQL con datos) responde 500 genérico, sin stack ni mensaje interno', async () => {
    const repo = container.resolve(REPOSITORIOS_TOKENS.authRepository);
    jest
      .spyOn(repo, 'findSesionActiva')
      .mockRejectedValue(
        new Error("ER_ACCESS_DENIED: SELECT * FROM sesiones WHERE token='secreto' en /home/app/src/db.js")
      );
    const token = (await import('jsonwebtoken')).default.sign({ userId: 1 }, process.env.JWT_SECRET);

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Error interno del servidor');
    expect(res.body.error.stack).toBeUndefined();
    expect(res.body.error.name).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/secreto|ER_ACCESS_DENIED|sesiones/i);
    sinFiltraciones(res);
  });

  it('en producción también es genérico', async () => {
    const previo = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const repo = container.resolve(REPOSITORIOS_TOKENS.authRepository);
      jest.spyOn(repo, 'findSesionActiva').mockRejectedValue(new Error('detalle interno'));
      const token = (await import('jsonwebtoken')).default.sign({ userId: 1 }, process.env.JWT_SECRET);
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toMatch(/detalle interno/);
    } finally {
      process.env.NODE_ENV = previo;
    }
  });

  it('JSON malformado -> 4xx sin stack', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "a", ');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    sinFiltraciones(res);
  });

  it('ruta inexistente -> 404 sin stack', async () => {
    const res = await request(app).get('/api/v1/esto-no-existe');
    expect(res.status).toBe(404);
    sinFiltraciones(res);
  });

  it('las rutas protegidas no revelan si el recurso existe (401 antes que 404)', async () => {
    const a = await request(app).get('/api/v1/carreras/1');
    const b = await request(app).get('/api/v1/carreras/999999999');
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
  });
});

describe('Límite de tamaño del body', () => {
  it('un JSON de ~11 MB se rechaza con 413 (límite 10 MB)', async () => {
    const grande = JSON.stringify({ username: 'a'.repeat(11 * 1024 * 1024), password: 'x' });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send(grande);
    expect(res.status).toBe(413);
    sinFiltraciones(res);
  });

  it('un formulario urlencoded de ~11 MB también se rechaza con 413', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .type('form')
      .send(`username=${'a'.repeat(11 * 1024 * 1024)}`);
    expect(res.status).toBe(413);
  });

  it('un body dentro del límite no es rechazado por tamaño', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'a'.repeat(1000), password: 'x' });
    expect(res.status).not.toBe(413);
  });
});

describe('Archivos estáticos (/uploads)', () => {
  it.each([
    '/uploads/../package.json',
    '/uploads/..%2fpackage.json',
    '/uploads/%2e%2e/package.json',
    '/uploads/..%5cpackage.json',
    '/uploads/%2e%2e%2f%2e%2e%2f.env',
    '/uploads/....//package.json',
  ])('path traversal %s no expone archivos fuera de uploads', async (ruta) => {
    const res = await request(app).get(ruta);
    expect(res.text || '').not.toMatch(/instituto-incos-backend|DB_PASSWORD|JWT_SECRET/);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
