import { describe, it, expect, jest } from '@jest/globals';
import { ListAulasCatalogUseCase } from '../../../src/application/use-cases/aulas-horarios/ListAulasCatalogUseCase.js';

describe('ListAulasCatalogUseCase', () => {
  const crear = (result) => {
    const deps = {
      classroomRepository: { findAll: jest.fn().mockResolvedValue(result) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListAulasCatalogUseCase(deps) };
  };

  it('mapea aulas activas desde classrooms', async () => {
    const { deps, useCase } = crear({
      classrooms: [{ id: 1, code: 'A1', name: 'Aula 1', capacity: 30, category: 'TEORIA' }, { id: 2 }],
    });
    const res = await useCase.execute();
    expect(deps.classroomRepository.findAll).toHaveBeenCalledWith({ includeInactive: false }, 1, 500);
    expect(res.aulas).toEqual([
      { id: 1, codigo: 'A1', nombre: 'Aula 1', capacidad: 30, categoria: 'TEORIA' },
      { id: 2, codigo: null, nombre: null, capacidad: null, categoria: null },
    ]);
  });

  it('acepta items como alternativa y devuelve vacío si no hay datos', async () => {
    expect((await crear({ items: [{ id: 3 }] }).useCase.execute()).aulas).toHaveLength(1);
    expect((await crear({}).useCase.execute()).aulas).toEqual([]);
  });
});
