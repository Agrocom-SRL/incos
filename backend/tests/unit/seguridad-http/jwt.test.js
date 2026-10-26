/**
 * JWT manipulado contra `authenticate` (sobre src/app.js, sin BD: el repositorio de auth va simulado).
 * Un token solo vale si la firma HS256 es correcta Y existe una sesión activa en BD.
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../src/app.js';
import container from '../../../src/infrastructure/container/index.js';
import { REPOSITORIOS_TOKENS } from '../../../src/infrastructure/container/tokens/index.js';

const SECRETO = process.env.JWT_SECRET;
const RUTA = '/api/v1/carreras'; // protegida: authenticate + verificarPermiso
const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

const sesionActiva = (extra = {}) => ({
  usuario_id: 7,
  username: 'docente.uno',
  email: 'd@incos.test',
  foto_url: null,
  rol_id: 3,
  rol_codigo: 'DOCENTE',
  rol_is_system: 1,
  usuario_estado: null,
  ...extra,
});

describe('JWT manipulado -> 401', () => {
  let authRepository;
  beforeEach(() => {
    authRepository = container.resolve(REPOSITORIOS_TOKENS.authRepository);
    // Si el token llegara a aceptarse, la sesión existiría: así la única defensa evaluada es el JWT.
    jest.spyOn(authRepository, 'findSesionActiva').mockResolvedValue(sesionActiva());
    jest.spyOn(authRepository, 'tienePermiso').mockResolvedValue(false);
  });
  afterEach(() => jest.restoreAllMocks());

  const get = (cabecera) => {
    const r = request(app).get(RUTA);
    return cabecera === undefined ? r : r.set('Authorization', cabecera);
  };

  const valido = () => jwt.sign({ userId: 7, rolId: 3, rolCodigo: 'DOCENTE' }, SECRETO, { expiresIn: '1h' });

  it('control positivo: token válido pasa authenticate (llega a verificarPermiso -> 403)', async () => {
    const res = await get(`Bearer ${valido()}`);
    expect(res.status).toBe(403);
    expect(authRepository.tienePermiso).toHaveBeenCalledWith(7, expect.any(String), 'LISTAR');
  });

  it.each([
    ['sin cabecera Authorization', undefined],
    ['cabecera vacía', ''],
    ['solo "Bearer"', 'Bearer'],
    ['"Bearer " sin token', 'Bearer '],
    ['esquema Basic', 'Basic dXNlcjpwYXNz'],
    ['token sin esquema', 'abc.def.ghi'],
    ['esquema en minúsculas', 'bearer abc.def.ghi'],
    ['token basura', 'Bearer no-es-un-jwt'],
  ])('%s -> 401', async (_n, cabecera) => {
    const res = await get(cabecera);
    expect(res.status).toBe(401);
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('firma inválida (firmado con otro secreto) -> 401', async () => {
    const falso = jwt.sign({ userId: 7, rolCodigo: 'ADMIN_SISTEMA' }, 'otro-secreto');
    const res = await get(`Bearer ${falso}`);
    expect(res.status).toBe(401);
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('alg=none sin firma -> 401', async () => {
    const sinFirma = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ userId: 7, rolCodigo: 'ADMIN_SISTEMA' })}.`;
    const res = await get(`Bearer ${sinFirma}`);
    expect(res.status).toBe(401);
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('alg=none con firma arbitraria -> 401', async () => {
    const t = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ userId: 7 })}.${base64url('x')}`;
    expect((await get(`Bearer ${t}`)).status).toBe(401);
  });

  it('alg=NONE / None (mayúsculas) -> 401', async () => {
    for (const alg of ['NONE', 'None', 'nOnE']) {
      const t = `${base64url({ alg, typ: 'JWT' })}.${base64url({ userId: 7 })}.`;
      expect((await get(`Bearer ${t}`)).status).toBe(401);
    }
  });

  it('confusión de algoritmo: HS384/HS512 firmado con el secreto correcto -> 401 (solo HS256)', async () => {
    for (const algorithm of ['HS384', 'HS512']) {
      const t = jwt.sign({ userId: 7 }, SECRETO, { algorithm, expiresIn: '1h' });
      const res = await get(`Bearer ${t}`);
      expect(res.status).toBe(401);
    }
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('token expirado -> 401', async () => {
    const t = jwt.sign({ userId: 7, rolCodigo: 'DOCENTE' }, SECRETO, { expiresIn: -60 });
    const res = await get(`Bearer ${t}`);
    expect(res.status).toBe(401);
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('token aún no válido (nbf futuro) -> 401', async () => {
    const t = jwt.sign({ userId: 7, nbf: Math.floor(Date.now() / 1000) + 3600 }, SECRETO);
    expect((await get(`Bearer ${t}`)).status).toBe(401);
  });

  it('claims alterados conservando la firma original (payload escalado a ADMIN) -> 401', async () => {
    const [h, , firma] = valido().split('.');
    const payload = base64url({ userId: 1, rolId: 1, rolCodigo: 'ADMIN_SISTEMA', iat: 1, exp: 9999999999 });
    const res = await get(`Bearer ${h}.${payload}.${firma}`);
    expect(res.status).toBe(401);
    expect(authRepository.findSesionActiva).not.toHaveBeenCalled();
  });

  it('cabecera alterada conservando payload y firma -> 401', async () => {
    const [, p, firma] = valido().split('.');
    const h = base64url({ alg: 'HS256', typ: 'JWT', kid: '../../etc/passwd' });
    expect((await get(`Bearer ${h}.${p}.${firma}`)).status).toBe(401);
  });

  it('firma truncada o con bytes extra -> 401', async () => {
    const t = valido();
    expect((await get(`Bearer ${t.slice(0, -4)}`)).status).toBe(401);
    expect((await get(`Bearer ${t}AAAA`)).status).toBe(401);
  });

  it('token válido sin sesión activa en BD (logout/revocado) -> 401', async () => {
    authRepository.findSesionActiva.mockResolvedValue(null);
    const res = await get(`Bearer ${valido()}`);
    expect(res.status).toBe(401);
  });

  it('la identidad sale de la sesión en BD, no de los claims del token', async () => {
    // Token afirma ADMIN_SISTEMA, la sesión dice DOCENTE (usuario 7): se autoriza como usuario 7.
    const t = jwt.sign({ userId: 1, rolId: 1, rolCodigo: 'ADMIN_SISTEMA' }, SECRETO, { expiresIn: '1h' });
    const res = await get(`Bearer ${t}`);
    expect(res.status).toBe(403);
    expect(authRepository.tienePermiso).toHaveBeenCalledWith(7, expect.any(String), 'LISTAR');
  });

  it('cuenta suspendida/bloqueada -> 403 aunque el token sea válido', async () => {
    authRepository.findSesionActiva.mockResolvedValue(sesionActiva({ usuario_estado: 'SUSPENDIDO' }));
    const res = await get(`Bearer ${valido()}`);
    expect(res.status).toBe(403);
    expect(authRepository.tienePermiso).not.toHaveBeenCalled();
  });
});
