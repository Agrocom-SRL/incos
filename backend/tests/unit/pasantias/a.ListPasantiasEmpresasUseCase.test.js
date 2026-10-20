import { describe, it, expect, jest } from '@jest/globals';
import { ListPasantiasEmpresasUseCase } from '../../../src/application/use-cases/pasantias/ListPasantiasEmpresasUseCase.js';

describe('ListPasantiasEmpresasUseCase', () => {
  const crear = (result = { pasantiasEmpresas: [{ id: 1 }, { id: 2 }], total: 45 }) => {
    const deps = {
      pasantiaEmpresaRepository: { findAll: jest.fn().mockResolvedValue(result) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListPasantiasEmpresasUseCase(deps) };
  };

  it('lista con paginación y calcula totalPages', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ search: 'ac' }, 2, 20, {});

    expect(deps.pasantiaEmpresaRepository.findAll).toHaveBeenCalledWith(
      { search: 'ac', includeInactive: false },
      2,
      20
    );
    expect(result).toEqual({
      pasantiasEmpresas: [{ id: 1 }, { id: 2 }],
      total: 45,
      page: 2,
      limit: 20,
      totalPages: 3,
    });
  });

  it.each([['true'], [true]])('incluirInactivos=%p activa includeInactive', async (v) => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: v });
    expect(deps.pasantiaEmpresaRepository.findAll.mock.calls[0][0].includeInactive).toBe(true);
  });

  it('incluirInactivos distinto de true no incluye inactivos', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'false' });
    expect(deps.pasantiaEmpresaRepository.findAll.mock.calls[0][0].includeInactive).toBe(false);
  });

  it('agrega tipoSocietario solo si viene', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { tipoSocietario: 'SRL' });
    expect(deps.pasantiaEmpresaRepository.findAll.mock.calls[0][0].tipoSocietario).toBe('SRL');

    await useCase.execute({}, 1, 10, {});
    expect(deps.pasantiaEmpresaRepository.findAll.mock.calls[1][0]).not.toHaveProperty(
      'tipoSocietario'
    );
  });

  it('usa valores por defecto y sanea page/limit inválidos', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(undefined, 'abc', 0);

    expect(deps.pasantiaEmpresaRepository.findAll).toHaveBeenCalledWith(
      { search: undefined, includeInactive: false },
      1,
      50
    );
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it('sin total en el repositorio usa la longitud de la página; sin lista devuelve vacío', async () => {
    const { useCase } = crear({ pasantiasEmpresas: [{ id: 1 }] });
    expect((await useCase.execute()).total).toBe(1);

    const { useCase: vacio } = crear({});
    expect(await vacio.execute()).toMatchObject({
      pasantiasEmpresas: [],
      total: 0,
      totalPages: 0,
    });
  });
});
