import { describe, it, expect, jest } from '@jest/globals';
import { ListPeriodosByPlanUseCase } from '../../../src/application/use-cases/configuracion/ListPeriodosByPlanUseCase.js';

describe('ListPeriodosByPlanUseCase', () => {
  const crear = (result) => {
    const periodRepository = { findAll: jest.fn().mockResolvedValue(result) };
    return { periodRepository, useCase: new ListPeriodosByPlanUseCase({ periodRepository, logger: { info: jest.fn() } }) };
  };

  it('consulta por plan ordenado por número, sin paginar, y devuelve { periodos }', async () => {
    const { useCase, periodRepository } = crear({ periods: [{ id: 1, name: 'P1', number: 1 }] });
    const res = await useCase.execute(6);
    expect(periodRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 6, sort: 'numero:ASC' }, null, null);
    expect(res).toEqual({ periodos: [{ id: 1, nombre: 'P1', numero: 1 }] });
  });

  it('devuelve lista vacía si no hay colección', async () => {
    const { useCase } = crear({});
    await expect(useCase.execute(6)).resolves.toEqual({ periodos: [] });
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, periodRepository } = crear({});
    periodRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(6)).rejects.toThrow('db');
  });
});
