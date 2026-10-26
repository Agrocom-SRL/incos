/**
 * Matriz exhaustiva sin BD: TODA ruta registrada del router, salvo la lista pública explícita,
 * debe responder 401 sin token (el middleware `authenticate` corta antes de tocar la BD).
 * Si alguien añade una ruta sin `authenticate`, esta prueba falla.
 */
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import { listarRutas, rutaConcreta } from '../../helpers/rutas.js';
import { RUTAS_PUBLICAS, esPublica } from '../../helpers/rutas-publicas.js';

const rutas = listarRutas(app);
const protegidas = rutas.filter((r) => !esPublica(r));

describe('Matriz de rutas sin token', () => {
  it('enumera las rutas de la API (sanidad del recorrido)', () => {
    expect(rutas.length).toBeGreaterThan(300);
    expect(protegidas.length).toBeGreaterThan(300);
    expect(rutas.some((r) => r.metodo === 'POST' && r.ruta === '/api/v1/auth/login')).toBe(true);
  });

  it('la lista pública explícita solo contiene rutas que existen', () => {
    for (const p of RUTAS_PUBLICAS) {
      expect(rutas.some((r) => r.metodo === p.metodo && r.ruta === p.ruta)).toBe(true);
    }
  });

  it.each(protegidas.map((r) => [`${r.metodo} ${r.ruta}`, r]))('%s -> 401 sin token', async (_n, r) => {
    const res = await request(app)[r.metodo.toLowerCase()](rutaConcreta(r.ruta));
    expect(res.status).toBe(401);
  });

  it('un Authorization sin esquema Bearer también da 401 en una ruta protegida', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });
});
