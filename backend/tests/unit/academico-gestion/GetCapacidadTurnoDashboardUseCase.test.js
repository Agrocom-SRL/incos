import { describe, it, expect, jest } from '@jest/globals';
import { GetCapacidadTurnoDashboardUseCase } from '../../../src/application/use-cases/academico/GetCapacidadTurnoDashboardUseCase.js';

describe('GetCapacidadTurnoDashboardUseCase', () => {
  const crear = (rows) => {
    const deps = {
      parallelRepository: { obtenerCapacidadTurnoDashboard: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetCapacidadTurnoDashboardUseCase(deps) };
  };

  it('devuelve las filas del repositorio', async () => {
    const rows = [{ turno: 'MANANA' }];
    const { useCase, deps } = crear(rows);
    await expect(useCase.execute()).resolves.toBe(rows);
    expect(deps.parallelRepository.obtenerCapacidadTurnoDashboard).toHaveBeenCalledTimes(1);
  });

  it.each([[null], [undefined]])('devuelve [] si el repositorio responde %p', async (v) => {
    const { useCase } = crear(v);
    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
