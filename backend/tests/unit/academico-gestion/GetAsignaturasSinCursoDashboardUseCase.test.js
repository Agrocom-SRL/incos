import { describe, it, expect, jest } from '@jest/globals';
import { GetAsignaturasSinCursoDashboardUseCase } from '../../../src/application/use-cases/academico/GetAsignaturasSinCursoDashboardUseCase.js';

describe('GetAsignaturasSinCursoDashboardUseCase', () => {
  const crear = (rows) => {
    const deps = {
      parallelRepository: { obtenerAsignaturasSinCursoDashboard: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetAsignaturasSinCursoDashboardUseCase(deps) };
  };

  it('devuelve las filas del repositorio', async () => {
    const rows = [{ materia: 'X' }];
    const { useCase, deps } = crear(rows);
    await expect(useCase.execute()).resolves.toBe(rows);
    expect(deps.parallelRepository.obtenerAsignaturasSinCursoDashboard).toHaveBeenCalledTimes(1);
  });

  it.each([[null], [undefined]])('devuelve [] si el repositorio responde %p', async (v) => {
    const { useCase } = crear(v);
    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
