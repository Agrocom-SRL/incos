import { describe, it, expect, jest } from '@jest/globals';
import { ListarUsuariosUseCase } from '../../../src/application/use-cases/seguridad/ListarUsuariosUseCase.js';

describe('ListarUsuariosUseCase', () => {
  const crear = (rows = [], total = 0) => {
    const userRepository = {
      countAllWithRoleSearch: jest.fn().mockResolvedValue(total),
      findAllPaginatedWithRole: jest.fn().mockResolvedValue(rows),
    };
    return { userRepository, useCase: new ListarUsuariosUseCase({ userRepository }) };
  };

  it('valores por defecto y mapeo sin password', async () => {
    const { userRepository, useCase } = crear([{ id: 1, username: 'a', password_hash: 'h', rol_id: 1 }], 1);
    const res = await useCase.execute({});
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenCalledWith({
      page: 1, limit: 20, search: null, sort: 'id:ASC', rolCodigos: null,
    });
    expect(res.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    expect(JSON.stringify(res)).not.toMatch(/password|"h"/);
  });

  it('categoría conocida (sin importar mayúsculas) filtra por códigos de rol', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute({ categoria: ' Docente ' });
    expect(userRepository.countAllWithRoleSearch).toHaveBeenCalledWith({ search: null, rolCodigos: ['DOCENTE'] });
  });

  it('categoría "personal" incluye los roles institucionales', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute({ categoria: 'personal' });
    expect(userRepository.countAllWithRoleSearch.mock.calls[0][0].rolCodigos).toEqual(
      expect.arrayContaining(['RECTOR', 'SEC_ADMIN']),
    );
  });

  it('categoría desconocida no filtra', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute({ categoria: 'otra' });
    expect(userRepository.countAllWithRoleSearch.mock.calls[0][0].rolCodigos).toBeNull();
  });

  it('page/limit: NaN, negativos y excesos se normalizan', async () => {
    const { userRepository, useCase } = crear([], 250);
    const res = await useCase.execute({ page: 'abc', limit: 5000 });
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 100 }));
    expect(res.pagination.totalPages).toBe(3);
    await useCase.execute({ page: -4, limit: -1 });
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 1 }));
    await useCase.execute({ page: NaN, limit: NaN });
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('search con trim; vacío equivale a null; sort se propaga', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute({ search: '  ana ', sort: 'username:DESC' });
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'ana', sort: 'username:DESC' }),
    );
    await useCase.execute({ search: '   ' });
    expect(userRepository.findAllPaginatedWithRole).toHaveBeenLastCalledWith(expect.objectContaining({ search: null }));
  });

  it('sin resultados: totalPages mínimo 1', async () => {
    const { useCase } = crear([], 0);
    expect((await useCase.execute({})).pagination.totalPages).toBe(1);
  });
});
