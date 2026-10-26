import { describe, it, expect, jest } from '@jest/globals';
import { body } from 'express-validator';
import * as u from '../../../../src/presentation/validators/seguridad/usuarios.validator.js';
import { loginValidator, validateLoginRequest } from '../../../../src/presentation/validators/auth/login.validator.js';
import { cambiarMiPasswordValidator, validateCambiarMiPasswordRequest } from '../../../../src/presentation/validators/auth/cambiar-mi-password.validator.js';
import { buildNombreDescripcionValidators, createDiscapacidadValidator, updateTipoParentescoValidator } from '../../../../src/presentation/validators/referencia/nombre-descripcion.validator.js';
import { UnprocessableEntityError } from '../../../../src/domain/errors/AppError.js';
import { buildReq, buildRes, camposInvalidos } from '../_helpers/controllerHarness.js';
import { MALICIOSOS } from './_tabla.js';

/** Ejecuta la cadena y luego el middleware que traduce los errores a 422. */
const conMiddleware = async (cadena, middleware, reqBody) => {
  const req = buildReq({ method: 'POST', body: reqBody });
  for (const c of cadena) await c.run(req);
  const next = jest.fn();
  middleware(req, buildRes(), next);
  return next;
};

describe('auth: loginValidator', () => {
  const login = (b) => camposInvalidos(loginValidator, { body: b });

  it('acepta credenciales válidas y límites', async () => {
    expect(await login({ username: 'admin', password: '12345678' })).toEqual([]);
    expect(await login({ username: 'u'.repeat(50), password: 'p'.repeat(100) })).toEqual([]);
    expect(await login({ username: '  ana  ', password: 'contraseña-larga' })).toEqual([]);
  });

  it.each([
    ['username', undefined],
    ['username', ''],
    ['username', '    '],
    ['username', 'u'.repeat(51)],
    ['username', 42],
    ['username', ['a']],
    ['username', { $gt: '' }],
    ['password', undefined],
    ['password', ''],
    ['password', '1234567'],
    ['password', 'p'.repeat(101)],
    ['password', 12345678],
    ['password', { $ne: null }],
  ])('rechaza %s=%j', async (campo, valor) => {
    const base = { username: 'admin', password: '12345678' };
    const body = { ...base, [campo]: valor };
    if (valor === undefined) delete body[campo];
    expect(await login(body)).toContain(campo);
  });

  it.each(MALICIOSOS.filter((m) => typeof m !== 'string'))('rechaza objetos y arreglos como credenciales: %j', async (m) => {
    expect(await login({ username: m, password: m })).toEqual(expect.arrayContaining(['username']));
  });

  it('validateLoginRequest responde 422 con el detalle por campo', async () => {
    const next = await conMiddleware(loginValidator, validateLoginRequest, { username: '', password: 'x' });
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(UnprocessableEntityError);
    expect(error.details.map((d) => d.field)).toEqual(expect.arrayContaining(['username', 'password']));
  });

  it('validateLoginRequest continúa si no hay errores', async () => {
    const next = await conMiddleware(loginValidator, validateLoginRequest, { username: 'admin', password: '12345678' });
    expect(next).toHaveBeenCalledWith();
  });
});

describe('auth: cambiarMiPasswordValidator', () => {
  const cambiar = (b) => camposInvalidos(cambiarMiPasswordValidator, { body: b });

  it('acepta contraseña actual y nueva de 8 a 100 caracteres', async () => {
    expect(await cambiar({ password_actual: 'x', password_nuevo: '12345678' })).toEqual([]);
    expect(await cambiar({ password_actual: 'x', password_nuevo: 'p'.repeat(100) })).toEqual([]);
  });

  it.each([
    ['password_actual', undefined],
    ['password_actual', ''],
    ['password_actual', 123],
    ['password_actual', { $gt: '' }],
    ['password_nuevo', undefined],
    ['password_nuevo', ''],
    ['password_nuevo', '1234567'],
    ['password_nuevo', 'p'.repeat(101)],
  ])('rechaza %s=%j', async (campo, valor) => {
    const body = { password_actual: 'x', password_nuevo: '12345678', [campo]: valor };
    if (valor === undefined) delete body[campo];
    expect(await cambiar(body)).toContain(campo);
  });

  it('validateCambiarMiPasswordRequest responde 422 o continúa', async () => {
    const malo = await conMiddleware(cambiarMiPasswordValidator, validateCambiarMiPasswordRequest, {});
    expect(malo.mock.calls[0][0]).toBeInstanceOf(UnprocessableEntityError);
    expect(malo.mock.calls[0][0].details.length).toBeGreaterThan(0);
    const bueno = await conMiddleware(cambiarMiPasswordValidator, validateCambiarMiPasswordRequest, { password_actual: 'a', password_nuevo: '12345678' });
    expect(bueno).toHaveBeenCalledWith();
  });
});

describe('seguridad: ids de ruta', () => {
  it.each([
    ['usuarioIdParamValidator', 'id'],
    ['rolIdParamValidator', 'id'],
    ['overrideIdParamValidator', 'overrideId'],
  ])('%s', async (nombre, param) => {
    expect(await camposInvalidos(u[nombre], { params: { [param]: '3' } })).toEqual([]);
    for (const malo of ['0', '-1', 'abc', '1.5', ...MALICIOSOS]) {
      expect(await camposInvalidos(u[nombre], { params: { [param]: malo } })).toContain(param);
    }
  });
});

describe('seguridad: consultas de listado', () => {
  it.each(['usuariosListQueryValidator', 'rolUsuariosListQueryValidator'])('%s', async (nombre) => {
    const lista = (query) => camposInvalidos(u[nombre], { query });
    expect(await lista({})).toEqual([]);
    expect(await lista({ page: '2', limit: '100', search: 'ana', sort: 'username' })).toEqual([]);
    expect(await lista({ page: '0' })).toContain('page');
    expect(await lista({ limit: '101' })).toContain('limit');
    expect(await lista({ limit: 'x' })).toContain('limit');
    expect(await lista({ search: { $ne: 1 } })).toContain('search');
    expect(await lista({ sort: ['a'] })).toEqual(expect.any(Array));
  });

  it('usuariosListQueryValidator filtra por categoría conocida', async () => {
    const lista = (query) => camposInvalidos(u.usuariosListQueryValidator, { query });
    for (const categoria of ['sistema', 'estudiante', 'docente', 'personal']) expect(await lista({ categoria })).toEqual([]);
    for (const malo of ['admin', 'SISTEMA', ...MALICIOSOS]) expect(await lista({ categoria: malo })).toContain('categoria');
  });

  it('permisosCatalogoQueryValidator limita el dominio a 50 caracteres', async () => {
    const lista = (query) => camposInvalidos(u.permisosCatalogoQueryValidator, { query });
    expect(await lista({})).toEqual([]);
    expect(await lista({ dominio: 'titulacion' })).toEqual([]);
    expect(await lista({ dominio: 'x'.repeat(50) })).toEqual([]);
    expect(await lista({ dominio: 'x'.repeat(51) })).toContain('dominio');
    expect(await lista({ dominio: '' })).toContain('dominio');
  });
});

describe('seguridad: crearUsuarioValidator', () => {
  const valido = { username: 'ana', password: '12345678', rol_id: 2 };
  const crear = (b) => camposInvalidos(u.crearUsuarioValidator, { body: b });

  it('acepta usuario mínimo y completo', async () => {
    expect(await crear(valido)).toEqual([]);
    expect(await crear({ ...valido, categoria_creacion: 'ASIGNAR_DOCENTE', docente_id: 4, estudiante_id: null, personal: { nombres: 'A' }, referencia_id: 3, tipo_referencia: 'RECTOR' })).toEqual([]);
    for (const categoria_creacion of ['ACCESO_SISTEMA', 'PERSONAL_INSTITUCIONAL', 'ASIGNAR_ESTUDIANTE', null]) {
      expect(await crear({ ...valido, categoria_creacion })).toEqual([]);
    }
  });

  it.each([
    ['username', undefined],
    ['username', '   '],
    ['username', 'u'.repeat(51)],
    ['password', undefined],
    ['password', '1234567'],
    ['password', 'p'.repeat(101)],
    ['rol_id', undefined],
    ['rol_id', 0],
    ['rol_id', 'admin'],
    ['categoria_creacion', 'SUPERUSUARIO'],
    ['estudiante_id', 0],
    ['docente_id', 'x'],
    ['personal', 'texto'],
    ['referencia_id', -1],
    ['tipo_referencia', 'ADMIN'],
  ])('rechaza %s=%j', async (campo, valor) => {
    const body = { ...valido, [campo]: valor };
    if (valor === undefined) delete body[campo];
    expect(await crear(body)).toContain(campo);
  });

  it.each(MALICIOSOS)('rechaza carga maliciosa %j en rol_id y categoria_creacion', async (m) => {
    expect(await crear({ ...valido, rol_id: m })).toContain('rol_id');
    expect(await crear({ ...valido, categoria_creacion: m })).toContain('categoria_creacion');
  });
});

describe('seguridad: actualizarUsuarioValidator', () => {
  const editar = (b) => camposInvalidos(u.actualizarUsuarioValidator, { body: b });

  it('acepta cuerpo vacío y cambios parciales', async () => {
    expect(await editar({})).toEqual([]);
    expect(await editar({ username: 'nuevo', rol_id: 3, foto_url: null, password: null, categoria_creacion: 'ACCESO_SISTEMA', estudiante_id: 1, docente_id: null, personal: {} })).toEqual([]);
    expect(await editar({ password: '12345678' })).toEqual([]);
  });

  it.each([
    ['username', '   '],
    ['username', 'u'.repeat(51)],
    ['rol_id', 0],
    ['foto_url', 42],
    ['password', '123'],
    ['password', 'p'.repeat(101)],
    ['categoria_creacion', 'OTRA'],
    ['estudiante_id', 0],
    ['docente_id', 'x'],
    ['personal', []],
  ])('rechaza %s=%j', async (campo, valor) => {
    expect(await editar({ [campo]: valor })).toContain(campo);
  });
});

describe('seguridad: cambiarEstadoUsuarioBodyValidator', () => {
  const estado = (b) => camposInvalidos(u.cambiarEstadoUsuarioBodyValidator, { body: b });

  it.each([null, 'BLOQUEADO', 'SUSPENDIDO', 'RETIRADO'])('acepta estado=%p', async (valor) => {
    expect(await estado({ estado: valor })).toEqual([]);
  });

  it.each([undefined, 'ACTIVO', '', 0, false, 'bloqueado', ...MALICIOSOS])('rechaza estado=%j', async (valor) => {
    const body = valor === undefined ? {} : { estado: valor };
    expect(await estado(body)).toContain('estado');
  });

  it('el motivo debe ser texto', async () => {
    expect(await estado({ estado: null, motivo: 'por inactividad' })).toEqual([]);
    expect(await estado({ estado: null, motivo: null })).toEqual([]);
    expect(await estado({ estado: null, motivo: 5 })).toContain('motivo');
  });
});

describe('seguridad: cambiarPasswordValidator', () => {
  const cambiar = (b) => camposInvalidos(u.cambiarPasswordValidator, { body: b });

  it('exige password_nuevo de 8 a 100 caracteres', async () => {
    expect(await cambiar({ password_nuevo: '12345678' })).toEqual([]);
    expect(await cambiar({ password_nuevo: 'p'.repeat(100) })).toEqual([]);
    for (const malo of [undefined, '', '1234567', 'p'.repeat(101)]) {
      expect(await cambiar(malo === undefined ? {} : { password_nuevo: malo })).toContain('password_nuevo');
    }
  });
});

describe('seguridad: overrides y roles', () => {
  const acciones = ['LISTAR', 'DETALLE', 'CREAR', 'EDITAR', 'ELIMINAR', 'ACTIVAR', 'APROBAR', 'EXPORTAR', 'GENERAR_PDF'];

  it('agregarOverrideValidator', async () => {
    const run = (b) => camposInvalidos(u.agregarOverrideValidator, { body: b });
    const ok = { permiso_id: 4, accion: 'EDITAR', tipo: 'GRANT' };
    expect(await run(ok)).toEqual([]);
    expect(await run({ ...ok, tipo: 'REVOKE', motivo: 'auditoría' })).toEqual([]);
    for (const accion of acciones) expect(await run({ ...ok, accion })).toEqual([]);
    for (const [campo, malo] of [['permiso_id', 0], ['accion', 'VER'], ['accion', ''], ['tipo', 'DENY'], ['tipo', undefined], ['motivo', 5], ['permiso_id', 'x']]) {
      const body = { ...ok, [campo]: malo };
      if (malo === undefined) delete body[campo];
      expect(await run(body)).toContain(campo);
    }
    expect(await run({ ...ok, accion: "LISTAR'; DROP TABLE permisos;--" })).toContain('accion');
  });

  it('crearRolValidator normaliza el código a mayúsculas', async () => {
    const run = (b) => camposInvalidos(u.crearRolValidator, { body: b });
    expect(await run({ codigo: 'rol_nuevo', nombre: 'Rol nuevo' })).toEqual([]);
    expect(await run({ codigo: 'ROL_1', nombre: 'Rol', tipo: 'INTERNO' })).toEqual([]);
    expect(await run({ codigo: 'AB', nombre: 'Ro', tipo: null })).toEqual([]);
    for (const [campo, malo] of [
      ['codigo', undefined],
      ['codigo', 'A'],
      ['codigo', 'A'.repeat(51)],
      ['codigo', 'con espacio'],
      ['codigo', 'rol-con-guion'],
      ['codigo', "ROL'; DROP"],
      ['nombre', undefined],
      ['nombre', 'A'],
      ['nombre', 'N'.repeat(101)],
      ['tipo', 5],
      ['tipo', 'T'.repeat(51)],
    ]) {
      const body = { codigo: 'ROL_OK', nombre: 'Rol ok', [campo]: malo };
      if (malo === undefined) delete body[campo];
      expect(await run(body)).toContain(campo);
    }
  });

  it('actualizarPermisosRolValidator valida cada asignación', async () => {
    const run = (b) => camposInvalidos(u.actualizarPermisosRolValidator, { body: b });
    expect(await run({ asignaciones: [] })).toEqual([]);
    expect(await run({ asignaciones: [{ permiso_id: 1, accion: 'LISTAR' }, { permiso_id: 2, accion: 'EXPORTAR' }] })).toEqual([]);
    expect(await run({})).toContain('asignaciones');
    expect(await run({ asignaciones: 'todas' })).toContain('asignaciones');
    expect(await run({ asignaciones: [{ permiso_id: 0, accion: 'LISTAR' }] })).toContain('asignaciones[0].permiso_id');
    expect(await run({ asignaciones: [{ permiso_id: 1, accion: 'VER' }] })).toContain('asignaciones[0].accion');
    expect(await run({ asignaciones: [{ permiso_id: 1 }] })).toContain('asignaciones[0].accion');
  });
});

describe('seguridad: validateSeguridadRequest', () => {
  it('responde 422 con field, message y value; o continúa', async () => {
    const malo = await conMiddleware(u.cambiarPasswordValidator, u.validateSeguridadRequest, { password_nuevo: 'x' });
    const error = malo.mock.calls[0][0];
    expect(error).toBeInstanceOf(UnprocessableEntityError);
    expect(error.details[0]).toEqual(expect.objectContaining({ field: 'password_nuevo', message: expect.any(String) }));
    const bueno = await conMiddleware(u.cambiarPasswordValidator, u.validateSeguridadRequest, { password_nuevo: '12345678' });
    expect(bueno).toHaveBeenCalledWith();
  });
});

describe('referencia: nombre y descripción', () => {
  it('usa límites por defecto (100 y 500) cuando no se configuran', async () => {
    const { createValidator, updateValidator } = buildNombreDescripcionValidators();
    expect(await camposInvalidos(createValidator, { body: { nombre: 'n'.repeat(100), descripcion: 'd'.repeat(500) } })).toEqual([]);
    expect(await camposInvalidos(createValidator, { body: { nombre: 'n'.repeat(101) } })).toContain('nombre');
    expect(await camposInvalidos(createValidator, { body: { nombre: 'ok', descripcion: 'd'.repeat(501) } })).toContain('descripcion');
    expect(await camposInvalidos(updateValidator, { body: {} })).toEqual([]);
  });

  it('create exige nombre de 2+ caracteres, texto y activo booleano', async () => {
    for (const malo of [undefined, '', 'a', 5, { $gt: '' }]) {
      expect(await camposInvalidos(createDiscapacidadValidator, { body: malo === undefined ? {} : { nombre: malo } })).toContain('nombre');
    }
    expect(await camposInvalidos(createDiscapacidadValidator, { body: { nombre: 'Visual', descripcion: null, activo: true } })).toEqual([]);
    expect(await camposInvalidos(createDiscapacidadValidator, { body: { nombre: 'Visual', activo: 'quizá' } })).toContain('activo');
  });

  it('update de tipos de parentesco limita el nombre a 50 caracteres', async () => {
    expect(await camposInvalidos(updateTipoParentescoValidator, { body: { nombre: 'n'.repeat(50) } })).toEqual([]);
    expect(await camposInvalidos(updateTipoParentescoValidator, { body: { nombre: 'n'.repeat(51) } })).toContain('nombre');
    expect(await camposInvalidos(updateTipoParentescoValidator, { body: { nombre: 'a' } })).toContain('nombre');
    expect(await camposInvalidos(updateTipoParentescoValidator, { body: { descripcion: 7 } })).toContain('descripcion');
  });
});

describe('helper: body de express-validator disponible', () => {
  it('sanity: el harness acepta cadenas sueltas', async () => {
    expect(await camposInvalidos([body('x').isInt()], { body: { x: 'a' } })).toEqual(['x']);
  });
});
