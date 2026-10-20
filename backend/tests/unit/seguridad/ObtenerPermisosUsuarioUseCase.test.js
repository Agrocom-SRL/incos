import { describe, it, expect, jest } from '@jest/globals';
import { ObtenerPermisosUsuarioUseCase } from '../../../src/application/use-cases/seguridad/ObtenerPermisosUsuarioUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ObtenerPermisosUsuarioUseCase', () => {
  const crear = (user) => {
    const deps = {
      userRepository: { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(user) },
      rolePermissionRepository: {
        findFlatByRolId: jest.fn().mockResolvedValue([{ permiso_id: 1, codigo: 'u', accion: 'LISTAR' }]),
      },
      permissionRepository: {
        findAllAccionesValidasFlat: jest.fn().mockResolvedValue([
          { permiso_id: 9, codigo: 'z', nombre: 'Z', dominio: 'SEG', accion: 'CREAR' },
        ]),
      },
      userPermissionRepository: {
        findOverridesRawByUsuarioId: jest.fn().mockResolvedValue([
          { id: 3, codigo: 'u', accion: 'EDITAR', tipo: 'REVOKE', permiso_id: 1 },
        ]),
      },
      authRepository: {
        findPermisosEfectivos: jest.fn().mockResolvedValue([{ permiso_codigo: 'u', accion: 'LISTAR' }]),
      },
    };
    return { deps, useCase: new ObtenerPermisosUsuarioUseCase(deps) };
  };
  const base = { id: 5, username: 'ana', email: 'a@x', password_hash: 'h', rol_id: 2, rol_codigo: 'DOCENTE', rol_nombre: 'Docente' };

  it('combina permisos del rol, overrides y efectivos; no expone password', async () => {
    const { deps, useCase } = crear(base);
    const res = await useCase.execute(5);
    expect(deps.rolePermissionRepository.findFlatByRolId).toHaveBeenCalledWith(2);
    expect(deps.authRepository.findPermisosEfectivos).toHaveBeenCalledWith(5);
    expect(res.permisos_rol).toEqual([{ permiso_id: 1, codigo: 'u', nombre: null, dominio: 'GENERAL', accion: 'LISTAR' }]);
    expect(res.overrides[0]).toMatchObject({ tipo: 'REVOKE', accion: 'EDITAR', motivo: null });
    expect(res.efectivos).toEqual([{ codigo: 'u', acciones: ['LISTAR'] }]);
    expect(res.usuario.rol).toMatchObject({ id: 2, codigo: 'DOCENTE', is_system: false });
    expect(JSON.stringify(res)).not.toMatch(/password/);
  });

  it('ADMIN_SISTEMA (rol 1) usa el catálogo completo', async () => {
    const { deps, useCase } = crear({ ...base, rol_id: 1, rol_is_system: 1 });
    const res = await useCase.execute(5);
    expect(deps.permissionRepository.findAllAccionesValidasFlat).toHaveBeenCalled();
    expect(deps.rolePermissionRepository.findFlatByRolId).not.toHaveBeenCalled();
    expect(res.permisos_rol[0].permiso_id).toBe(9);
    expect(res.usuario.rol.is_system).toBe(true);
  });

  it('usuario sin rol: rol null y permisos_rol vacío', async () => {
    const { deps, useCase } = crear({ ...base, rol_id: null });
    const res = await useCase.execute(5);
    expect(res.usuario.rol).toBeNull();
    expect(res.permisos_rol).toEqual([]);
    expect(deps.rolePermissionRepository.findFlatByRolId).not.toHaveBeenCalled();
  });

  it('usuario inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.authRepository.findPermisosEfectivos).not.toHaveBeenCalled();
  });
});
