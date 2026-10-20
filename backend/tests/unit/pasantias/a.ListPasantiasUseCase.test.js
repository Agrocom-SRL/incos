import { describe, it, expect, jest } from '@jest/globals';
import { ListPasantiasUseCase } from '../../../src/application/use-cases/pasantias/ListPasantiasUseCase.js';

describe('ListPasantiasUseCase', () => {
  const crear = (result = { rows: [], total: 0 }) => {
    const deps = {
      pasantiaViewRepository: { findListado: jest.fn().mockResolvedValue(result) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListPasantiasUseCase(deps) };
  };

  it('mapea filas de la vista y calcula paginación', async () => {
    const rows = [{ pasantia_id: 1, tipo: 'PASANTIA', estado: 'SOLICITADA', horas_cumplidas: '8' }];
    const { useCase } = crear({ rows, total: 51 });

    const result = await useCase.execute({}, 1, 25, {});

    expect(result.pasantias).toHaveLength(1);
    expect(result.pasantias[0]).toMatchObject({ id: 1, estado: 'SOLICITADA', horasCumplidas: 8 });
    expect(result).toMatchObject({ total: 51, page: 1, limit: 25, totalPages: 3 });
  });

  it('convierte los filtros de query a números y los pasa al repositorio', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ search: 'juan' }, 2, 10, {
      carreraId: '3',
      gestionId: '4',
      estado: 'EN_CURSO',
      tipo: 'CONVALIDACION',
      docenteSupervisorId: '5',
      estudianteId: '6',
    });

    expect(deps.pasantiaViewRepository.findListado).toHaveBeenCalledWith(
      {
        search: 'juan',
        carreraId: 3,
        gestionId: 4,
        estado: 'EN_CURSO',
        tipo: 'CONVALIDACION',
        docenteSupervisorId: 5,
        estudianteId: 6,
      },
      2,
      10
    );
  });

  it('filtros ausentes quedan undefined y page/limit inválidos usan defaults', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(undefined, 'x', null, undefined);

    const [filters, page, limit] = deps.pasantiaViewRepository.findListado.mock.calls[0];
    expect(Object.values(filters).every((v) => v === undefined)).toBe(true);
    expect([page, limit]).toEqual([1, 50]);
    expect(result).toMatchObject({ pasantias: [], total: 0, totalPages: 0 });
  });
});
