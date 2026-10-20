import { describe, it, expect, jest } from '@jest/globals';
import { ListModalidadesGradoUseCase } from '../../../src/application/use-cases/titulacion/ListModalidadesGradoUseCase.js';

describe('ListModalidadesGradoUseCase', () => {
  const crear = (result = { modalidadesGrado: [], total: 0 }) => {
    const deps = {
      modalidadGradoRepository: { findAll: jest.fn().mockResolvedValue(result) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListModalidadesGradoUseCase(deps) };
  };

  it('lista con paginación por defecto y delega el filtro search', async () => {
    const mods = [{ id: 1, codigo: 'PSP' }, { id: 2, codigo: 'TG' }];
    const { useCase, deps } = crear({ modalidadesGrado: mods, total: 2 });
    const r = await useCase.execute({ search: 'tesis' });
    expect(deps.modalidadGradoRepository.findAll).toHaveBeenCalledWith({ search: 'tesis' }, 1, 50);
    expect(r).toEqual({ modalidadesGrado: mods, total: 2, page: 1, limit: 50, totalPages: 1 });
  });

  it('calcula totalPages con page y limit dados', async () => {
    const { useCase, deps } = crear({ modalidadesGrado: [{ id: 1 }], total: 45 });
    const r = await useCase.execute({}, '2', '20');
    expect(deps.modalidadGradoRepository.findAll).toHaveBeenCalledWith({ search: undefined }, 2, 20);
    expect(r).toEqual(expect.objectContaining({ page: 2, limit: 20, totalPages: 3 }));
  });

  it('page y limit no numéricos caen a los valores por defecto', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({}, 'abc', 'xyz');
    expect(deps.modalidadGradoRepository.findAll).toHaveBeenCalledWith({ search: undefined }, 1, 50);
    expect(r).toEqual(expect.objectContaining({ page: 1, limit: 50 }));
  });

  it('si el repositorio no informa total usa la cantidad de filas', async () => {
    const { useCase } = crear({ modalidadesGrado: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    const r = await useCase.execute();
    expect(r.total).toBe(3);
  });

  it('si el repositorio no devuelve la lista, retorna vacío', async () => {
    const { useCase } = crear({});
    const r = await useCase.execute();
    expect(r).toEqual({ modalidadesGrado: [], total: 0, page: 1, limit: 50, totalPages: 0 });
  });
});
