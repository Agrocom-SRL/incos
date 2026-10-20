import { describe, it, expect, jest } from '@jest/globals';
import { ListCursosPorParaleloDocenteUseCase } from '../../../src/application/use-cases/docentes/ListCursosPorParaleloDocenteUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('ListCursosPorParaleloDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      parallelManagementRepository: {
        findByParallelAndManagementPlan: jest.fn().mockResolvedValue({ id: 7 }),
      },
      courseOfferRepository: {
        findCatalogByParallelManagementId: jest.fn().mockResolvedValue({ rows: [{ id: 5 }], total: 3 }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListCursosPorParaleloDocenteUseCase(deps) };
  };

  it('con paraleloGestionId directo no resuelve el paralelo', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ paraleloGestionId: '7', limit: 2 });
    expect(deps.parallelManagementRepository.findByParallelAndManagementPlan).not.toHaveBeenCalled();
    expect(deps.courseOfferRepository.findCatalogByParallelManagementId)
      .toHaveBeenCalledWith(7, { page: 1, limit: 2 });
    expect(res).toEqual({ cursos: [{ id: 5 }], total: 3, page: 1, limit: 2, totalPages: 2 });
  });

  it('resuelve el paralelo-gestión por paraleloId + gestionPlanId', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ paraleloId: 4, gestionPlanId: 3 });
    expect(deps.parallelManagementRepository.findByParallelAndManagementPlan).toHaveBeenCalledWith(4, 3);
    expect(deps.courseOfferRepository.findCatalogByParallelManagementId.mock.calls[0][0]).toBe(7);
  });

  it.each([[undefined], [0], ['abc']])('paraleloId inválido (%p) lanza NotFoundError', async (paraleloId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ paraleloId, gestionPlanId: 3 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([[undefined], [0], ['abc']])('gestionPlanId inválido (%p) lanza 422', async (gestionPlanId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ paraleloId: 4, gestionPlanId }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('lanza NotFoundError si el paralelo no está en gestión', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(null);
    await expect(useCase.execute({ paraleloId: 4, gestionPlanId: 3 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findCatalogByParallelManagementId).not.toHaveBeenCalled();
  });

  it('sin argumentos lanza NotFoundError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(NotFoundError);
  });
});
