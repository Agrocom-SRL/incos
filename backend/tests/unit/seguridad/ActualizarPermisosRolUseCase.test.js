import { describe, it, expect, jest } from '@jest/globals';
import { ActualizarPermisosRolUseCase } from '../../../src/application/use-cases/seguridad/ActualizarPermisosRolUseCase.js';
import { PERMISO_CATALOGO_REFERENCIA_ID } from '../../../src/domain/constants/usuarios.constants.js';
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('ActualizarPermisosRolUseCase', () => {
  const crear = ({ rol = { id: 2 }, perm = { id: 7 }, valida = true } = {}) => {
    const deps = {
      roleRepository: { findById: jest.fn().mockResolvedValue(rol) },
      permissionRepository: {
        findById: jest.fn().mockResolvedValue(perm),
        existsPermisoAccionValida: jest.fn().mockResolvedValue(valida),
      },
      rolePermissionRepository: { replaceAllAssignmentsForRol: jest.fn().mockResolvedValue(undefined) },
      obtenerPermisosRolUseCase: { execute: jest.fn().mockResolvedValue({ rol: { id: 2 } }) },
    };
    return { deps, useCase: new ActualizarPermisosRolUseCase(deps) };
  };
  const asig = [{ permiso_id: 7, accion: 'LISTAR' }, { permiso_id: 7, accion: 'EDITAR' }];

  it('reemplaza asignaciones y devuelve los permisos actualizados', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2, { asignaciones: asig });
    expect(deps.permissionRepository.existsPermisoAccionValida).toHaveBeenCalledWith(7, 'EDITAR');
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).toHaveBeenCalledWith(2, asig);
    expect(deps.obtenerPermisosRolUseCase.execute).toHaveBeenCalledWith(2);
    expect(res).toEqual({ rol: { id: 2 } });
  });

  it('asignaciones vacías: limpia todos los permisos del rol', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { asignaciones: [] });
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).toHaveBeenCalledWith(2, []);
  });

  it.each([[1], ['1']])('rol ADMIN_SISTEMA (%p) es inmodificable: ForbiddenError', async (id) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(id, { asignaciones: asig })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('rol inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear({ rol: null });
    await expect(useCase.execute(9, { asignaciones: asig })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['x'], [{}]])('asignaciones %p no es array: 422', async (asignaciones) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { asignaciones })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it.each([
    [[null]],
    [[{ accion: 'LISTAR' }]],
    [[{ permiso_id: 7 }]],
    [[{ permiso_id: 7, accion: 'BORRAR' }]],
    [[{ permiso_id: 7, accion: 'listar' }]],
  ])('elemento inválido %j: 422 sin escribir', async (asignaciones) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { asignaciones })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('permiso_id NaN: el permiso no existe y se rechaza', async () => {
    const { deps, useCase } = crear({ perm: null });
    await expect(useCase.execute(2, { asignaciones: [{ permiso_id: NaN, accion: 'LISTAR' }] })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('combinación duplicada: 422', async () => {
    const { deps, useCase } = crear();
    await expect(
      useCase.execute(2, { asignaciones: [asig[0], { ...asig[0] }] }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('permiso inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear({ perm: null });
    await expect(useCase.execute(2, { asignaciones: asig })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('acción no válida para ese permiso: 422', async () => {
    const { deps, useCase } = crear({ valida: false });
    await expect(useCase.execute(2, { asignaciones: asig })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).not.toHaveBeenCalled();
  });

  it('descarta el permiso técnico de catálogo antes de validar y guardar', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, {
      asignaciones: [{ permiso_id: PERMISO_CATALOGO_REFERENCIA_ID, accion: 'LISTAR' }, asig[0]],
    });
    expect(deps.rolePermissionRepository.replaceAllAssignmentsForRol).toHaveBeenCalledWith(2, [asig[0]]);
    expect(deps.permissionRepository.findById).toHaveBeenCalledTimes(1);
  });
});
