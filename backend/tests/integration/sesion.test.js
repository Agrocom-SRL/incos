import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, login, request, app, API, USUARIOS } from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

describe('Ciclo de sesión (login -> /me -> logout -> /me)', () => {
  it('el logout invalida el token: después responde 401', async () => {
    const ingreso = await login(USUARIOS.ESTUDIANTE);
    expect(ingreso.status).toBe(200);
    const auth = { Authorization: `Bearer ${ingreso.body.data.token}` };

    const antes = await request(app).get(`${API}/auth/me`).set(auth);
    expect(antes.status).toBe(200);

    const salida = await request(app).post(`${API}/auth/logout`).set(auth);
    expect(salida.status).toBe(200);

    const despues = await request(app).get(`${API}/auth/me`).set(auth);
    expect(despues.status).toBe(401);
  });
});
