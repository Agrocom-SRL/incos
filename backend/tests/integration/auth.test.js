import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  iniciarSistema,
  cerrarSistema,
  login,
  request,
  app,
  API,
  como,
  sesionDe,
  ROLES,
  USUARIOS,
  PASSWORD_PRUEBA,
} from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

describe('POST /auth/login', () => {
  it.each(ROLES)('inicia sesión como %s y devuelve token, usuario con su rol y permisos', async (rol) => {
    const res = await login(USUARIOS[rol]);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { token, usuario, permisos } = res.body.data;
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(usuario.username).toBe(USUARIOS[rol]);
    expect(usuario.rol.codigo).toBe(rol);
    expect(Array.isArray(permisos)).toBe(true);
  });

  it('acepta el correo de la ficha vinculada como usuario', async () => {
    const res = await login('test.rector@incos.test');
    expect(res.status).toBe(200);
    expect(res.body.data.usuario.rol.codigo).toBe('RECTOR');
  });

  it('rechaza contraseña incorrecta con 401', async () => {
    const res = await login(USUARIOS.RECTOR, 'clave-incorrecta-123');
    expect(res.status).toBe(401);
    expect(res.body.data?.token).toBeUndefined();
  });

  it('rechaza usuario inexistente con 401 (mismo mensaje que clave mala)', async () => {
    const mala = await login(USUARIOS.RECTOR, 'clave-incorrecta-123');
    const inexistente = await login('no.existe.jamas', PASSWORD_PRUEBA);
    expect(inexistente.status).toBe(401);
    expect(inexistente.body.error?.message ?? inexistente.body.message).toBe(
      mala.body.error?.message ?? mala.body.message
    );
  });

  it('valida el cuerpo: sin password o con password corta responde 422', async () => {
    const sinPassword = await request(app).post(`${API}/auth/login`).send({ username: 'x' });
    expect(sinPassword.status).toBe(422);
    const corta = await login(USUARIOS.RECTOR, 'corta');
    expect(corta.status).toBe(422);
  });
});

describe('GET /auth/me', () => {
  it.each(ROLES)('devuelve el perfil y los permisos de %s, iguales a los del login', async (rol) => {
    const sesion = await sesionDe(rol);
    const res = await como(rol, 'get', '/auth/me');
    expect(res.status).toBe(200);
    const { usuario, permisos } = res.body.data;
    expect(usuario.rol.codigo).toBe(rol);
    expect(usuario.username).toBe(USUARIOS[rol]);
    expect(usuario.email).toBe(`${USUARIOS[rol]}@incos.test`);
    expect(usuario.vinculo_perfil).toBeTruthy();
    expect(permisos).toEqual(sesion.permisos);
  });

  it('sin token responde 401', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('con token mal formado responde 401', async () => {
    const res = await request(app)
      .get(`${API}/auth/me`)
      .set('Authorization', 'Bearer esto.no.es.un.jwt');
    expect(res.status).toBe(401);
  });

  it('con esquema de autorización distinto de Bearer responde 401', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });
});
