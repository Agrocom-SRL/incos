import { describe, it, expect, jest } from '@jest/globals';
import { ListTeachersUseCase } from '../../../src/application/use-cases/docentes/ListTeachersUseCase.js';

describe('ListTeachersUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue({
          teachers: [
            { id: 1, firstName: 'Ana', lastName: 'Perez', motherLastName: 'Gomez', ci: '12', expedition: 'LP' },
            { id: 2, firstName: 'Luis', lastName: 'Rojas' },
          ],
          total: 5,
        }),
        getTeachingLoadAndConflictStats: jest.fn().mockResolvedValue({
          1: { totalAsignaciones: 3, hasAsignaciones: true },
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListTeachersUseCase(deps) };
  };

  it('lista con paginación, nombre completo y estadísticas de carga', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ search: 'a' }, 2, 2, { page: 2 });

    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ search: 'a' }, 2, 2);
    expect(deps.teacherRepository.getTeachingLoadAndConflictStats).toHaveBeenCalledWith([1, 2]);
    expect(res).toMatchObject({ total: 5, page: 2, limit: 2, totalPages: 3 });
    expect(res.docentes[0]).toMatchObject({
      id: 1,
nombreCompleto: 'Ana Perez Gomez',
ciCompleto: '12 LP',
      teachingStats: { totalAsignaciones: 3 },
    });
    expect(res.docentes[1].teachingStats).toMatchObject({
      totalAsignaciones: 0, hasAsignaciones: false, conflictos: { total: 0, hasConflictos: false },
    });
  });

  it.each([['false'], [false], ['0'], [0]])(
    'incluir_estadisticas=%p omite la consulta de estadísticas',
    async (valor) => {
      const { useCase, deps } = crear();
      const res = await useCase.execute({}, 1, 10, { incluir_estadisticas: valor });
      expect(deps.teacherRepository.getTeachingLoadAndConflictStats).not.toHaveBeenCalled();
      expect(res.docentes[0].teachingStats).toBeUndefined();
    }
  );

  it('sin resultados no consulta estadísticas', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue({ teachers: [], total: 0 });
    const res = await useCase.execute({}, 1, 10, {});
    expect(res.docentes).toEqual([]);
    expect(res.totalPages).toBe(0);
    expect(deps.teacherRepository.getTeachingLoadAndConflictStats).not.toHaveBeenCalled();
  });

  it('page y limit no numéricos caen a los valores por defecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 'abc', 'xyz', {});
    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
  });
});
