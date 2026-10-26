/**
 * Cabeceras de seguridad (helmet) y CORS sobre src/app.js. Sin BD.
 */
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';

const ORIGEN_PERMITIDO = 'http://localhost:5173';
const ORIGEN_AJENO = 'https://evil.example';

describe('Cabeceras de seguridad (helmet)', () => {
  it.each([
    ['respuesta 200', () => request(app).get('/health')],
    ['respuesta 401', () => request(app).get('/api/v1/auth/me')],
    ['respuesta 404', () => request(app).get('/api/v1/no-existe-esta-ruta')],
  ])('%s lleva las cabeceras endurecidas', async (_n, hacer) => {
    const res = await hacer();
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['referrer-policy']).toBeDefined();
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });

  it('la CSP por defecto no permite scripts de cualquier origen', async () => {
    const res = await request(app).get('/health');
    const csp = res.headers['content-security-policy'];
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).not.toMatch(/script-src[^;]*\*/);
  });

  it('no revela el servidor ni la versión de Express', async () => {
    const res = await request(app).get('/health');
    expect(res.headers.server).toBeUndefined();
    expect(JSON.stringify(res.headers)).not.toMatch(/express/i);
  });
});

describe('CORS', () => {
  it('refleja un origen permitido y habilita credenciales', async () => {
    const res = await request(app).get('/health').set('Origin', ORIGEN_PERMITIDO);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGEN_PERMITIDO);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('un origen ajeno NO recibe Access-Control-Allow-Origin', async () => {
    const res = await request(app).get('/health').set('Origin', ORIGEN_AJENO);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('jamás responde "*" junto con credenciales', async () => {
    for (const origin of [ORIGEN_PERMITIDO, ORIGEN_AJENO, 'null']) {
      const res = await request(app).get('/health').set('Origin', origin);
      expect(res.headers['access-control-allow-origin']).not.toBe('*');
    }
  });

  it('el origen "null" (iframes sandbox / archivos locales) no se acepta', async () => {
    const res = await request(app).get('/health').set('Origin', 'null');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('un origen que solo contiene el permitido como subcadena no se acepta', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', `${ORIGEN_PERMITIDO}.evil.example`);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('preflight de origen permitido: métodos y cabeceras acotados', async () => {
    const res = await request(app)
      .options('/api/v1/carreras')
      .set('Origin', ORIGEN_PERMITIDO)
      .set('Access-Control-Request-Method', 'DELETE')
      .set('Access-Control-Request-Headers', 'authorization,content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGEN_PERMITIDO);
    expect(res.headers['access-control-allow-methods']).toBe('GET,POST,PUT,DELETE,PATCH,OPTIONS');
    expect(res.headers['access-control-allow-headers']).toMatch(/authorization/i);
  });

  it('preflight de origen ajeno: sin cabeceras CORS', async () => {
    const res = await request(app)
      .options('/api/v1/carreras')
      .set('Origin', ORIGEN_AJENO)
      .set('Access-Control-Request-Method', 'DELETE');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-methods']).toBeUndefined();
  });
});
