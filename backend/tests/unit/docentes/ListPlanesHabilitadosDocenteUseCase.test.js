import { describe, it, expect, jest } from '@jest/globals';
import { ListPlanesHabilitadosDocenteUseCase } from '../../../src/application/use-cases/docentes/ListPlanesHabilitadosDocenteUseCase.js';

describe('ListPlanesHabilitadosDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      managementPlanRepository: {
        findPlanesDocenteAsignacionCatalog: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], total: 250 }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListPlanesHabilitadosDocenteUseCase(deps) };
  };

  it('consulta el catálogo con la gestión y devuelve la paginación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ gestionId: '4', page: 1, limit: 100 });
    expect(deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog)
      .toHaveBeenCalledWith({ gestionId: 4, page: 1, limit: 100 });
    expect(res).toEqual({ planes: [{ id: 1 }], total: 250, page: 1, limit: 100, totalPages: 3 });
  });

  it.each([[null], [0], ['abc'], [undefined]])('gestionId (%p) sin valor válido no filtra', async (gestionId) => {
    const { useCase, deps } = crear();
    await useCase.execute({ gestionId });
    const arg = deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog.mock.calls[0][0];
    expect(arg.gestionId).toBeNull();
  });

  it('sin parámetros usa los valores por defecto', async () => {
    const { useCase } = crear();
    const res = await useCase.execute();
    expect(res).toMatchObject({ page: 1, limit: 200 });
  });

  it('limit y page no numéricos se normalizan', async () => {
    const { useCase } = crear();
    const res = await useCase.execute({ page: 'x', limit: 'y' });
    expect(res).toMatchObject({ page: 1, limit: 200 });
  });
});
