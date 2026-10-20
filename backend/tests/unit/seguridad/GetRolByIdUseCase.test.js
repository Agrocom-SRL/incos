import { describe, it, expect, jest } from '@jest/globals';
import { GetRolByIdUseCase } from '../../../src/application/use-cases/seguridad/GetRolByIdUseCase.js';
import { PERMISO_CATALOGO_REFERENCIA_ID } from '../../../src/domain/constants/usuarios.constants.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetRolByIdUseCase', () => {
  const crear = (rol = { id: 2, code: 'DOCENTE', name: 'Docente', tipo: 'T', isSystem: 0 }) => {
    const deps = {
      roleRepository: { findById: jest.fn().mockResolvedValue(rol) },
      rolePermissionRepository: {
        findFlatByRolId: jest.fn().mockResolvedValue([
          { permiso_id: 10 },
          { permiso_id: 11 },
          { permiso_id: PERMISO_CATALOGO_REFERENCIA_ID },
        ]),
      },
      permissionRepository: {
        findAllAccionesValidasFlat: jest.fn().mockResolvedValue([{ permiso_id: 1 }, { permiso_id: 2 }, { permiso_id: 3 }, { permiso_id: 4 }]),
      },
    };
    return { deps, useCase: new GetRolByIdUseCase(deps) };
  };

  it('devuelve ficha y cuenta permisos excluyendo el técnico', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2);
    expect(deps.rolePermissionRepository.findFlatByRolId).toHaveBeenCalledWith(2);
    expect(res.rol).toEqual({
      id: 2, codigo: 'DOCENTE', nombre: 'Docente', tipo: 'T', is_system: false, cantidadPermisos: 2,
    });
  });

  it('rol 1 cuenta el catálogo completo', async () => {
    const { deps, useCase } = crear({ id: 1, code: 'ADMIN_SISTEMA', name: 'A', isSystem: true });
    const res = await useCase.execute(1);
    expect(deps.rolePermissionRepository.findFlatByRolId).not.toHaveBeenCalled();
    expect(res.rol.cantidadPermisos).toBe(4);
    expect(res.rol.is_system).toBe(true);
  });

  it('rol inexistente: NotFoundError', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(77)).rejects.toBeInstanceOf(NotFoundError);
  });
});
