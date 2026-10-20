import { describe, it, expect, jest } from '@jest/globals';
import { ListPendientesNivelacionParaleloUseCase } from '../../../src/application/use-cases/academico/nivelaciones/ListPendientesNivelacionParaleloUseCase.js';

describe('ListPendientesNivelacionParaleloUseCase', () => {
  const crear = (rows) => {
    const repo = { contarPendientesPorParalelo: jest.fn().mockResolvedValue(rows) };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new ListPendientesNivelacionParaleloUseCase({ nivelacionParaleloViewRepository: repo, logger }) };
  };

  it('convierte los conteos a número', async () => {
    const { useCase, repo } = crear([
      { paralelo_gestion_id: '4', total_estudiantes: '30', total_pendientes: '2' },
      { paralelo_gestion_id: 5, total_estudiantes: null, total_pendientes: undefined },
    ]);
    const res = await useCase.execute();
    expect(repo.contarPendientesPorParalelo).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      paralelos: [
        { paraleloGestionId: 4, totalEstudiantes: 30, totalPendientes: 2 },
        { paraleloGestionId: 5, totalEstudiantes: 0, totalPendientes: 0 },
      ],
    });
  });

  it.each([[[]], [null]])('lista vacía con %p', async (rows) => {
    const { useCase } = crear(rows);
    await expect(useCase.execute()).resolves.toEqual({ paralelos: [] });
  });

  it('exige repositorio y logger', () => {
    expect(() => new ListPendientesNivelacionParaleloUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new ListPendientesNivelacionParaleloUseCase({ nivelacionParaleloViewRepository: {} })).toThrow(/requerido/);
  });
});
