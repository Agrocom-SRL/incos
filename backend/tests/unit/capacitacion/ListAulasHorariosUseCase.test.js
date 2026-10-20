import { describe, it, expect, jest } from '@jest/globals';
import { ListAulasHorariosUseCase } from '../../../src/application/use-cases/aulas-horarios/ListAulasHorariosUseCase.js';

describe('ListAulasHorariosUseCase', () => {
  const crear = (bloques = [], total = bloques.length) => {
    const deps = {
      aulasHorariosSemanaRepository: { findAll: jest.fn().mockResolvedValue({ bloques, total }) },
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListAulasHorariosUseCase(deps) };
  };

  it('lista bloques bajo la clave bloques con filtros normalizados', async () => {
    const { deps, useCase } = crear([{ id: 1 }], 12);
    const res = await useCase.execute({ search: 's' }, 2, 5, { dia: ' lunes ', turno: 'noche', aula_id: '4' });
    expect(deps.aulasHorariosSemanaRepository.findAll).toHaveBeenCalledWith(
      { search: 's', day: 'LUNES', shift: 'NOCHE', classroomId: 4 },
      2,
      5
    );
    expect(res).toMatchObject({ bloques: [{ id: 1 }], total: 12, page: 2, limit: 5, totalPages: 3 });
  });

  it('ignora día, turno y aula inválidos (incluye NaN, 0 y negativos)', () => {
    const { useCase } = crear();
    expect(useCase.buildSpecificFilters({ dia: 'FERIADO', turno: 'MADRUGADA', aula_id: 'abc' }, { a: 1 })).toEqual({ a: 1 });
    expect(useCase.buildSpecificFilters({ aula_id: 0 })).toEqual({});
    expect(useCase.buildSpecificFilters({ aula_id: -2 })).toEqual({});
    expect(useCase.buildSpecificFilters({ aula_id: NaN })).toEqual({});
  });

  it('sin queryParams usa los filtros base', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ search: 'z' });
    expect(deps.aulasHorariosSemanaRepository.findAll).toHaveBeenCalledWith({ search: 'z' }, 1, 50);
  });
});
