import { describe, it, expect, jest } from '@jest/globals';
import { ListFichasSeguimientoUseCase } from '../../../src/application/use-cases/docentes/supervision/ListFichasSeguimientoUseCase.js';

import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('ListFichasSeguimientoUseCase', () => {
  const crear = () => {
    const deps = {
      fichaSeguimientoListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({
          rows: [{ id: 1, docente_id: 3, docente_nombre: 'Perez Ana', docs_presentados: '2' }],
          total: 11,
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListFichasSeguimientoUseCase(deps) };
  };

  it('pasa filtros normalizados y devuelve el contrato de listado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(
      { search: 'perez' }, '2', '5', { docenteId: '3', gestionId: '2', fechaDesde: '2026-01-01', fechaHasta: '2026-12-31' }
    );

    expect(deps.fichaSeguimientoListadoViewRepository.findListado).toHaveBeenCalledWith(
      {
        search: 'perez',
docenteId: 3,
gestionId: 2,
        fechaDesde: '2026-01-01',
fechaHasta: '2026-12-31',
      },
      2,
      5
    );
    expect(res).toMatchObject({ total: 11, page: 2, limit: 5, totalPages: 3 });
    expect(res.fichasSeguimiento[0]).toMatchObject({
      id: 1, docenteId: 3, docenteNombre: 'Perez Ana', docsPresentados: 2, docsCompletos: '0/4',
    });
  });

  it('sin filtros usa valores por defecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute();
    expect(deps.fichaSeguimientoListadoViewRepository.findListado).toHaveBeenCalledWith(
      { search: undefined, docenteId: undefined, gestionId: undefined, fechaDesde: undefined, fechaHasta: undefined },
      1,
      50
    );
  });

  it('page y limit no numéricos caen a 1 y 50', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 'x', 'y', {});
    const args = deps.fichaSeguimientoListadoViewRepository.findListado.mock.calls[0];
    expect([args[1], args[2]]).toEqual([1, 50]);
  });

  it('sin resultados devuelve lista vacía y 0 páginas', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoListadoViewRepository.findListado.mockResolvedValue({ rows: [], total: 0 });
    const res = await useCase.execute({}, 1, 10, {});
    expect(res).toMatchObject({ fichasSeguimiento: [], total: 0, totalPages: 0 });
  });
});

describe('ListFichasSeguimientoUseCase filtros inválidos', () => {
  const crear = () => {
    const fichaSeguimientoListadoViewRepository = { findListado: jest.fn().mockResolvedValue({ rows: [], total: 0 }) };
    const logger = { info: jest.fn() };
    return {
      fichaSeguimientoListadoViewRepository,
      useCase: new ListFichasSeguimientoUseCase({ fichaSeguimientoListadoViewRepository, logger }),
    };
  };

  it.each([
    [{ docenteId: 'abc' }],
    [{ gestionId: '2x' }],
    [{ docenteId: '0' }],
    [{ fechaDesde: '2026-02-31' }],
    [{ fechaHasta: 'ayer' }],
  ])('rechaza %p sin consultar', async (query) => {
    const { useCase, fichaSeguimientoListadoViewRepository } = crear();
    await expect(useCase.execute({}, 1, 10, query)).rejects.toBeInstanceOf(ValidationError);
    expect(fichaSeguimientoListadoViewRepository.findListado).not.toHaveBeenCalled();
  });
});
