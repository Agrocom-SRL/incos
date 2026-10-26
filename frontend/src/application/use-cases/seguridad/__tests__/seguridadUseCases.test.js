import { describe, it, expect, vi } from 'vitest';
import * as UC from '../index';

const repo = () =>
  new Proxy(
    {},
    {
      get: (target, prop) => {
        if (!(prop in target)) target[prop] = vi.fn().mockResolvedValue({ ok: prop });
        return target[prop];
      },
    },
  );

describe('delegación simple a repositorios', () => {
  const casos = [
    ['ListarRolesUseCase', [], 'findAll', []],
    ['ListarUsuariosUseCase', [{ page: 2 }], 'findAll', [{ page: 2 }]],
    ['ListarUsuariosPorRolUseCase', [4, { page: 1 }], 'findUsuariosByRolId', [4, { page: 1 }]],
    ['ListarPermisosUseCase', ['MATRICULA'], 'findAllAgrupados', ['MATRICULA']],
    ['ObtenerRolUseCase', [3], 'findById', [3]],
    ['ObtenerUsuarioUseCase', [3], 'findById', [3]],
    ['ObtenerPermisosRolUseCase', [3], 'findPermisosById', [3]],
    ['ObtenerPermisosGrillaRolUseCase', [3, 'ACADEMICO'], 'findPermisosGrillaById', [3, 'ACADEMICO']],
    ['ObtenerPermisosUsuarioUseCase', [3], 'findPermisos', [3]],
    ['ActualizarUsuarioUseCase', [3, { a: 1 }], 'update', [3, { a: 1 }]],
    ['EliminarUsuarioUseCase', [3], 'remove', [3]],
    ['EliminarOverridePermisoUseCase', [3, 9], 'removeOverride', [3, 9]],
    ['AgregarOverridePermisoUseCase', [3, { tipo: 'GRANT', permiso_id: 1 }], 'addOverride', [3, { tipo: 'GRANT', permiso_id: 1 }]],
    ['CambiarEstadoUsuarioUseCase', [3, 'ACTIVO', 'ok'], 'changeEstado', [3, { estado: 'ACTIVO', motivo: 'ok' }]],
    ['CambiarPasswordUseCase', [3, 'clave1234'], 'changePassword', [3, { password_nuevo: 'clave1234' }]],
    ['ActualizarPermisosRolUseCase', [3, [{ permiso_id: 1, accion: 'LISTAR' }]], 'updatePermisos', [3, { asignaciones: [{ permiso_id: 1, accion: 'LISTAR' }] }]],
  ];

  it.each(casos)('%s llama al repositorio con los argumentos correctos', async (nombre, args, metodo, esperado) => {
    const r = repo();
    const uc = new UC[nombre](r);
    const res = await uc.ejecutar(...args);
    expect(r[metodo]).toHaveBeenCalledWith(...esperado);
    expect(res).toEqual({ ok: metodo });
  });
});

describe('validaciones de entrada', () => {
  it('CrearRolUseCase normaliza y valida', async () => {
    const r = repo();
    const uc = new UC.CrearRolUseCase(r);
    await uc.ejecutar({ codigo: ' rol_a ', nombre: ' Rol A ', tipo: ' X ' });
    expect(r.create).toHaveBeenCalledWith({ codigo: 'ROL_A', nombre: 'Rol A', tipo: 'X' });
    await uc.ejecutar({ codigo: 'B', nombre: 'B' });
    expect(r.create).toHaveBeenLastCalledWith({ codigo: 'B', nombre: 'B' });
    await expect(uc.ejecutar({ nombre: 'x' })).rejects.toThrow('Código requerido');
    await expect(uc.ejecutar({ codigo: 'a-b', nombre: 'x' })).rejects.toThrow('mayúsculas');
    await expect(uc.ejecutar({ codigo: 'A' })).rejects.toThrow('Nombre requerido');
  });

  it('CrearUsuarioUseCase exige usuario, contraseña de 8+ y rol', async () => {
    const r = repo();
    const uc = new UC.CrearUsuarioUseCase(r);
    const ok = { username: 'ana', password: '12345678', rol_id: 1 };
    await uc.ejecutar(ok);
    expect(r.create).toHaveBeenCalledWith(ok);
    await expect(uc.ejecutar({ ...ok, username: ' ' })).rejects.toThrow('Username requerido');
    await expect(uc.ejecutar({ ...ok, password: '123' })).rejects.toThrow('Mínimo 8');
    await expect(uc.ejecutar({ ...ok, rol_id: null })).rejects.toThrow('Rol requerido');
  });

  it('el resto valida antes de llamar al repositorio', async () => {
    const r = repo();
    await expect(new UC.ActualizarPermisosRolUseCase(r).ejecutar(1, 'x')).rejects.toThrow('Asignaciones requeridas');
    await expect(new UC.EliminarUsuarioUseCase(r).ejecutar(null)).rejects.toThrow('Id de usuario');
    await expect(new UC.CambiarEstadoUsuarioUseCase(r).ejecutar(1, 'BLOQUEADO', '')).rejects.toThrow('Motivo requerido');
    await expect(new UC.CambiarPasswordUseCase(r).ejecutar(1, 'corta')).rejects.toThrow('Mínimo 8');
    await expect(new UC.AgregarOverridePermisoUseCase(r).ejecutar(1, { tipo: 'X' })).rejects.toThrow('Tipo inválido');
    expect(r.remove).not.toHaveBeenCalled();
    expect(r.changePassword).not.toHaveBeenCalled();
  });
});
