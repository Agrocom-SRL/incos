import { describe, it, expect, jest } from '@jest/globals';
import { GetGestionConflictosUseCase } from '../../../src/application/use-cases/horarios/GetGestionConflictosUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/index.js';

describe('GetGestionConflictosUseCase', () => {
  const crear = () => {
    const deps = {
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      managementPlanRepository: {
        findPlanesDocenteAsignacionCatalog: jest
          .fn()
          .mockResolvedValue({ rows: [{ id: 100 }, { gestionPlanId: 101 }] }),
      },
      parallelManagementRepository: { findEnrichedByManagementPlanId: jest.fn() },
      horarioConflictosService: { listarConflictosParaleloGestion: jest.fn().mockResolvedValue([]) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetGestionConflictosUseCase(deps) };
  };

  it.each([[0], ['x'], [undefined]])('NotFound con id inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si la gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(2)).rejects.toThrow(NotFoundError);
  });

  it('agrega solo paralelos con conflictos, enriquece cada conflicto y consulta cada plan', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findEnrichedByManagementPlanId.mockImplementation(async (planId) =>
      planId === 100
        ? [
            { id: 11, paraleloId: 5, paraleloNombre: 'A', turno: 'TARDE' },
            { id: 12, paraleloId: 6, paraleloNombre: 'B', turno: 'NOCHE' },
          ]
        : [{ id: 13, parallelId: 7, paraleloNombre: 'C', turno: 'TARDE' }]
    );
    deps.horarioConflictosService.listarConflictosParaleloGestion.mockImplementation(async (pgId) =>
      pgId === 12 ? [] : pgId === 11 ? [{ tipo: 'DOCENTE' }, { tipo: 'AULA' }] : [{ tipo: 'PARALELO' }]
    );

    const out = await useCase.execute('2');

    expect(deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog)
      .toHaveBeenCalledWith({ gestionId: 2, page: 1, limit: 500 });
    expect(deps.parallelManagementRepository.findEnrichedByManagementPlanId).toHaveBeenCalledWith(100);
    expect(deps.parallelManagementRepository.findEnrichedByManagementPlanId).toHaveBeenCalledWith(101);
    expect(out.gestion_id).toBe(2);
    expect(out.paralelos).toEqual([
      { paralelo_gestion_id: 11, paralelo_id: 5, paralelo_nombre: 'A', turno: 'TARDE', total: 2 },
      { paralelo_gestion_id: 13, paralelo_id: 7, paralelo_nombre: 'C', turno: 'TARDE', total: 1 },
    ]);
    expect(out.conflictos).toHaveLength(3);
    expect(out.conflictos[0]).toEqual({
      tipo: 'DOCENTE', paralelo_gestion_id: 11, paralelo_id: 5, paralelo_nombre: 'A', turno: 'TARDE',
    });
  });

  it('sin conflictos devuelve listas vacías', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findEnrichedByManagementPlanId.mockResolvedValue([{ id: 11 }]);
    const out = await useCase.execute(2);
    expect(out).toEqual({ gestion_id: 2, paralelos: [], conflictos: [] });
  });

  it('omite planes sin id numérico', async () => {
    const { useCase, deps } = crear();
    deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog.mockResolvedValue({ rows: [{ id: 'abc' }] });
    await useCase.execute(2);
    expect(deps.parallelManagementRepository.findEnrichedByManagementPlanId).not.toHaveBeenCalled();
  });
});
