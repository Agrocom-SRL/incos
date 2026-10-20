import { jest } from '@jest/globals';
import { ListAuthorizedBanksUseCase } from '../../../src/application/use-cases/pagos/ListAuthorizedBanksUseCase.js';

describe('ListAuthorizedBanksUseCase', () => {
  const crear = (items = [{ id: 1 }, { id: 2 }], total = 2) => {
    const repo = { findAll: jest.fn().mockResolvedValue({ authorizedBanks: items, total }) };
    const finanzasUsosViewRepository = { getUsosByCatalogo: jest.fn().mockResolvedValue(new Map([[1, { cantidadPagos: 2, cantidadCuentas: 1 }]])) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { repo, finanzasUsosViewRepository, useCase: new ListAuthorizedBanksUseCase({ authorizedBankRepository: repo, finanzasUsosViewRepository, logger }) };
  };

  it('lista, pagina y agrega conteos de uso del catálogo BANCO', async () => {
    const { useCase, repo, finanzasUsosViewRepository } = crear();
    const res = await useCase.execute({ x: 1 }, '2', '10');
    expect(repo.findAll).toHaveBeenCalledWith({ x: 1 }, 2, 10);
    expect(finanzasUsosViewRepository.getUsosByCatalogo).toHaveBeenCalledWith('BANCO');
    expect(res).toMatchObject({ total: 2, page: 2, limit: 10, totalPages: 1 });
    expect(res.bancosAutorizados).toHaveLength(2);
    expect(res.bancosAutorizados[0]).toMatchObject({ id: 1, cantidadPagos: 2, cantidadCuentas: 1, cantidadAsignaciones: 0, totalReferencias: 3 });
    expect(res.bancosAutorizados[1]).toMatchObject({ id: 2, totalReferencias: 0 });
  });

  it('traduce incluirInactivos a includeInactive', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({}, 1, 50, { incluirInactivos: 'true' });
    expect(repo.findAll.mock.calls[0][0]).toEqual({ includeInactive: true });
    await useCase.execute({}, 1, 50, { incluirInactivos: 'false' });
    expect(repo.findAll.mock.calls[1][0]).toEqual({ includeInactive: false });
  });

  it('lista vacía devuelve arreglo vacío', async () => {
    const { useCase } = crear([], 0);
    const res = await useCase.execute();
    expect(res.bancosAutorizados).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, repo } = crear();
    repo.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
  });
});
