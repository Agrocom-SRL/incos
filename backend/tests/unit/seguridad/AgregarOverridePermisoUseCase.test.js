import { describe, it, expect, jest } from '@jest/globals';
import { AgregarOverridePermisoUseCase } from '../../../src/application/use-cases/seguridad/AgregarOverridePermisoUseCase.js';
import { ConflictError, NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('AgregarOverridePermisoUseCase', () => {
  const crear = ({ user = { id: 5 }, perm = { id: 7, code: 'usuarios' }, dup = false } = {}) => {
    const deps = {
      userRepository: { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(user) },
      permissionRepository: { findById: jest.fn().mockResolvedValue(perm) },
      userPermissionRepository: {
        existsActiveDuplicate: jest.fn().mockResolvedValue(dup),
        create: jest.fn().mockResolvedValue({ id: 99 }),
      },
    };
    return { deps, useCase: new AgregarOverridePermisoUseCase(deps) };
  };
  const body = { permiso_id: 7, accion: 'EDITAR', tipo: 'REVOKE', motivo: 'sospecha' };

  it('crea el override y devuelve el contrato', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(5, body);
    expect(deps.userPermissionRepository.existsActiveDuplicate).toHaveBeenCalledWith(5, 7, 'EDITAR', 'REVOKE');
    expect(deps.userPermissionRepository.create).toHaveBeenCalledWith({
      userId: 5, permissionId: 7, action: 'EDITAR', overrideType: 'REVOKE', reason: 'sospecha',
    });
    expect(res).toEqual({ id: 99, permiso_id: 7, codigo: 'usuarios', accion: 'EDITAR', tipo: 'REVOKE', motivo: 'sospecha' });
  });

  it('GRANT sin motivo guarda motivo null', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(5, { permiso_id: 7, accion: 'LISTAR', tipo: 'GRANT' });
    expect(deps.userPermissionRepository.create.mock.calls[0][0].reason).toBeNull();
    expect(res.motivo).toBeNull();
  });

  it('usuario inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear({ user: null });
    await expect(useCase.execute(5, body)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userPermissionRepository.create).not.toHaveBeenCalled();
  });

  it.each([['BORRAR'], [''], [undefined], ['listar'], [NaN]])('acción %p inválida: 422', async (accion) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { ...body, accion })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userPermissionRepository.create).not.toHaveBeenCalled();
  });

  it.each([['ALLOW'], [''], [undefined], ['grant'], [NaN]])('tipo %p inválido: 422', async (tipo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { ...body, tipo })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userPermissionRepository.create).not.toHaveBeenCalled();
  });

  it('permiso inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear({ perm: null });
    await expect(useCase.execute(5, body)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userPermissionRepository.create).not.toHaveBeenCalled();
  });

  it('override duplicado activo: ConflictError', async () => {
    const { deps, useCase } = crear({ dup: true });
    await expect(useCase.execute(5, body)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.userPermissionRepository.create).not.toHaveBeenCalled();
  });
});
