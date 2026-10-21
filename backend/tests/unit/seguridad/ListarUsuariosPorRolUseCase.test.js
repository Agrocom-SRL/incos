import { describe, it, expect, jest } from '@jest/globals';
import { ListarUsuariosPorRolUseCase } from '../../../src/application/use-cases/seguridad/ListarUsuariosPorRolUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListarUsuariosPorRolUseCase', () => {
  const crear = (rol = { id: 2 }, rows = [], total = 0) => {
    const deps = {
      userRepository: {
        countAllWithRoleSearch: jest.fn().mockResolvedValue(total),
        findAllPaginatedWithRole: jest.fn().mockResolvedValue(rows),
      },
      roleRepository: { findById: jest.fn().mockResolvedValue(rol) },
    };
    return { deps, useCase: new ListarUsuariosPorRolUseCase(deps) };
  };

  it('filtra por rolId, pagina y mapea sin password', async () => {
    const { deps, useCase } = crear({ id: 2 }, [{ id: 1, username: 'a', password_hash: 'h', rol_id: 2 }], 45);
    const res = await useCase.execute(2, { page: '2', limit: '20', search: ' a ' });
    expect(deps.userRepository.findAllPaginatedWithRole).toHaveBeenCalledWith({
      page: 2, limit: 20, search: 'a', sort: 'id:ASC', rolId: 2,
    });
    expect(deps.userRepository.countAllWithRoleSearch).toHaveBeenCalledWith({ search: 'a', rolId: 2 });
    expect(res.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
    expect(JSON.stringify(res)).not.toMatch(/password/);
  });

  it('rol inexistente: NotFoundError sin listar', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userRepository.findAllPaginatedWithRole).not.toHaveBeenCalled();
  });

  it('query omitida y valores NaN usan defaults; limit se topa en 100', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2);
    expect(deps.userRepository.findAllPaginatedWithRole).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, limit: 20, search: null }),
    );
    await useCase.execute(2, { page: NaN, limit: 1e6 });
    expect(deps.userRepository.findAllPaginatedWithRole).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, limit: 100 }),
    );
  });
});
