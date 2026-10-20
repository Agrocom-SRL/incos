import { describe, it, expect, jest } from '@jest/globals';
import { ListPeriodosDocenteAsignacionUseCase } from '../../../src/application/use-cases/docentes/ListPeriodosDocenteAsignacionUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListPeriodosDocenteAsignacionUseCase', () => {
  const crear = () => {
    const deps = {
      managementPlanRepository: { findById: jest.fn().mockResolvedValue({ id: 3, studyPlanId: 2 }) },
      periodRepository: {
        findAll: jest.fn().mockResolvedValue({
          periods: [{ id: 1, name: '1er año', number: 1, displayOrder: 1, studyPlanId: 2 }],
          total: 1,
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListPeriodosDocenteAsignacionUseCase(deps) };
  };

  it('lista los periodos del plan de estudios del plan habilitado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ gestionPlanId: '3', page: 1, limit: 20 });
    expect(deps.periodRepository.findAll)
      .toHaveBeenCalledWith({ studyPlanId: 2, sort: 'ordenVisualizacion:ASC' }, 1, 20);
    expect(res).toEqual({
      periodos: [{ id: 1, nombre: '1er año', numero: 1, ordenVisualizacion: 1, planEstudioId: 2 }],
      total: 1,
page: 1,
limit: 20,
totalPages: 1,
    });
  });

  it.each([[0], [-2], ['abc'], [undefined]])('gestionPlanId inválido (%p) lanza NotFoundError', async (gp) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ gestionPlanId: gp })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el plan no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionPlanId: 3 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('plan sin studyPlanId devuelve lista vacía sin consultar periodos', async () => {
    const { useCase, deps } = crear();
    deps.managementPlanRepository.findById.mockResolvedValue({ id: 3, studyPlanId: null });
    const res = await useCase.execute({ gestionPlanId: 3 });
    expect(res).toEqual({ periodos: [], total: 0, page: 1, limit: 100, totalPages: 0 });
    expect(deps.periodRepository.findAll).not.toHaveBeenCalled();
  });
});
