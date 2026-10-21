import { describe, it, expect, jest } from '@jest/globals';
import { ListCursosDisponiblesDocenteUseCase } from '../../../src/application/use-cases/docentes/ListCursosDisponiblesDocenteUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListCursosDisponiblesDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      managementPlanRepository: { findById: jest.fn().mockResolvedValue({ id: 3 }) },
      courseOfferRepository: {
        findCatalogByManagementPlanId: jest.fn().mockResolvedValue({ rows: [{ id: 5 }], total: 1 }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListCursosDisponiblesDocenteUseCase(deps) };
  };

  it('lista la oferta del plan habilitado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ gestionPlanId: '3', page: 2, limit: 10 });
    expect(deps.courseOfferRepository.findCatalogByManagementPlanId)
      .toHaveBeenCalledWith(3, { page: 2, limit: 10 });
    expect(res).toEqual({ cursos: [{ id: 5 }], total: 1, page: 2, limit: 10, totalPages: 1 });
  });

  it.each([[0], [-1], ['abc'], [undefined]])('gestionPlanId inválido (%p) lanza NotFoundError', async (gp) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ gestionPlanId: gp })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.findById).not.toHaveBeenCalled();
  });

  it('sin argumentos lanza NotFoundError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el plan no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionPlanId: 3 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findCatalogByManagementPlanId).not.toHaveBeenCalled();
  });

  it('limit/page no numéricos se normalizan en la respuesta', async () => {
    const { useCase } = crear();
    const res = await useCase.execute({ gestionPlanId: 3, page: 'x', limit: 'y' });
    expect(res).toMatchObject({ page: 1, limit: 500 });
  });
});
