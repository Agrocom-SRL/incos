import { describe, it, expect, jest } from '@jest/globals';
import { ListarRolesUseCase } from '../../../src/application/use-cases/seguridad/ListarRolesUseCase.js';

describe('ListarRolesUseCase', () => {
  it('mapea roles y consulta ordenado por nombre', async () => {
    const roleRepository = {
      findAllOrderedByName: jest.fn().mockResolvedValue([
        { id: 1, code: 'ADMIN_SISTEMA', name: 'Admin', isSystem: 1 },
        { id: 2, code: 'DOCENTE', name: 'Docente', tipo: 'X', isSystem: false },
      ]),
    };
    const res = await new ListarRolesUseCase({ roleRepository }).execute();
    expect(roleRepository.findAllOrderedByName).toHaveBeenCalledTimes(1);
    expect(res.roles).toEqual([
      { id: 1, codigo: 'ADMIN_SISTEMA', nombre: 'Admin', tipo: null, is_system: true },
      { id: 2, codigo: 'DOCENTE', nombre: 'Docente', tipo: 'X', is_system: false },
    ]);
  });

  it('sin roles devuelve lista vacía', async () => {
    const roleRepository = { findAllOrderedByName: jest.fn().mockResolvedValue([]) };
    expect(await new ListarRolesUseCase({ roleRepository }).execute()).toEqual({ roles: [] });
  });
});
