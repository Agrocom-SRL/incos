import { describe, it, expect, jest } from '@jest/globals';
import { ObtenerPermisosRolUseCase } from '../../../src/application/use-cases/seguridad/ObtenerPermisosRolUseCase.js';
import { PERMISO_CATALOGO_REFERENCIA_ID } from '../../../src/domain/constants/usuarios.constants.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ObtenerPermisosRolUseCase', () => {
  const crear = (rol = { id: 2, code: 'DOCENTE', name: 'Docente', isSystem: false }) => {
    const deps = {
      roleRepository: { findById: jest.fn().mockResolvedValue(rol) },
      rolePermissionRepository: {
        findFlatByRolId: jest.fn().mockResolvedValue([
          { dominio: 'SEG', permiso_id: 10, codigo: 'u', nombre: 'U', accion: 'LISTAR' },
          { dominio: 'SEG', permiso_id: PERMISO_CATALOGO_REFERENCIA_ID, codigo: 'cat', nombre: 'C', accion: 'LISTAR' },
        ]),
      },
      permissionRepository: {
        findAllAccionesValidasFlat: jest.fn().mockResolvedValue([
          { dominio: 'ACA', permiso_id: 20, codigo: 'm', nombre: 'M', accion: 'CREAR' },
        ]),
      },
    };
    return { deps, useCase: new ObtenerPermisosRolUseCase(deps) };
  };

  it('rol normal: usa permisos del rol y oculta el permiso técnico de catálogo', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2);
    expect(deps.rolePermissionRepository.findFlatByRolId).toHaveBeenCalledWith(2);
    expect(deps.permissionRepository.findAllAccionesValidasFlat).not.toHaveBeenCalled();
    expect(res.rol).toEqual({ id: 2, codigo: 'DOCENTE', nombre: 'Docente', is_system: false });
    expect(res.permisos_por_dominio.SEG.map((p) => p.permiso_id)).toEqual([10]);
  });

  it('rol 1 (ADMIN_SISTEMA, también como string): catálogo completo de acciones válidas', async () => {
    const { deps, useCase } = crear({ id: 1, code: 'ADMIN_SISTEMA', name: 'A', isSystem: true });
    const res = await useCase.execute('1');
    expect(deps.permissionRepository.findAllAccionesValidasFlat).toHaveBeenCalled();
    expect(deps.rolePermissionRepository.findFlatByRolId).not.toHaveBeenCalled();
    expect(Object.keys(res.permisos_por_dominio)).toEqual(['ACA']);
  });

  it('rol inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.rolePermissionRepository.findFlatByRolId).not.toHaveBeenCalled();
  });

  it('id NaN: el repositorio no encuentra rol y falla con NotFoundError', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(NaN)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.roleRepository.findById).toHaveBeenCalledWith(NaN);
  });
});
