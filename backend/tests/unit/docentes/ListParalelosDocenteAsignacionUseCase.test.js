import { describe, it, expect, jest } from '@jest/globals';
import { ListParalelosDocenteAsignacionUseCase } from '../../../src/application/use-cases/docentes/ListParalelosDocenteAsignacionUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('ListParalelosDocenteAsignacionUseCase', () => {
  const crear = () => {
    const deps = {
      managementPlanRepository: {
        findById: jest.fn().mockResolvedValue({ id: 3, studyPlanId: 2, managementId: 1 }),
      },
      studyPlanRepository: { findById: jest.fn().mockResolvedValue({ id: 2, careerId: 9 }) },
      periodRepository: { findById: jest.fn().mockResolvedValue({ id: 6, studyPlanId: 2 }) },
      parallelRepository: {
        findAll: jest.fn().mockResolvedValue({
          parallels: [
            { id: 10, name: 'A', shift: 'MAÑANA', careerId: 9, periodId: 6 },
            { id: 11, name: 'B', shift: 'TARDE', careerId: 9, periodId: 6 },
          ],
          total: 2,
        }),
        obtenerEstadisticasYPeriodoPorGestion: jest.fn().mockResolvedValue([
          { paralelo_id: 10, total_inscritos: '5', total_hombres: '2', total_mujeres: 3 },
        ]),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListParalelosDocenteAsignacionUseCase(deps) };
  };

  it('lista paralelos de la carrera/periodo con estadísticas de la gestión', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ gestionPlanId: '3', periodoId: '6', page: 1, limit: 10 });

    expect(deps.parallelRepository.findAll)
      .toHaveBeenCalledWith({ careerId: 9, periodId: 6, sort: 'nombre:ASC' }, 1, 10);
    expect(deps.parallelRepository.obtenerEstadisticasYPeriodoPorGestion)
      .toHaveBeenCalledWith([10, 11], 1);
    expect(res).toMatchObject({ total: 2, page: 1, limit: 10, totalPages: 1 });
    expect(res.paralelos[0]).toMatchObject({
      id: 10,
nombre: 'A',
turno: 'MAÑANA',
carreraId: 9,
periodoId: 6,
      estadisticas: { totalInscritos: 5, totalHombres: 2, totalMujeres: 3 },
    });
    expect(res.paralelos[1].estadisticas).toEqual({
      totalInscritos: 0, totalHombres: 0, totalMujeres: 0,
    });
  });

  it('sin paralelos no consulta estadísticas', async () => {
    const { useCase, deps } = crear();
    deps.parallelRepository.findAll.mockResolvedValue({ parallels: [], total: 0 });
    const res = await useCase.execute({ gestionPlanId: 3, periodoId: 6 });
    expect(res.paralelos).toEqual([]);
    expect(deps.parallelRepository.obtenerEstadisticasYPeriodoPorGestion).not.toHaveBeenCalled();
  });

  it.each([[0], ['abc'], [undefined]])('gestionPlanId inválido (%p) lanza NotFoundError', async (gp) => {
    const { useCase } = crear();
    await expect(useCase.execute({ gestionPlanId: gp, periodoId: 6 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([[0], ['abc'], [undefined], [-1]])('periodoId inválido (%p) lanza 422', async (periodoId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ gestionPlanId: 3, periodoId }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.managementPlanRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el plan habilitado no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionPlanId: 3, periodoId: 6 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el periodo no existe', async () => {
    const { useCase, deps } = crear();
    deps.periodRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionPlanId: 3, periodoId: 6 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rechaza un periodo de otro plan de estudios', async () => {
    const { useCase, deps } = crear();
    deps.periodRepository.findById.mockResolvedValue({ id: 6, studyPlanId: 99 });
    await expect(useCase.execute({ gestionPlanId: 3, periodoId: 6 }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.parallelRepository.findAll).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el plan de estudios no existe', async () => {
    const { useCase, deps } = crear();
    deps.studyPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ gestionPlanId: 3, periodoId: 6 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('plan habilitado sin plan de estudios o carrera devuelve lista vacía', async () => {
    const a = crear();
    a.deps.managementPlanRepository.findById.mockResolvedValue({ id: 3, studyPlanId: null });
    expect((await a.useCase.execute({ gestionPlanId: 3, periodoId: 6 })).paralelos).toEqual([]);

    const b = crear();
    b.deps.studyPlanRepository.findById.mockResolvedValue({ id: 2, careerId: null });
    expect((await b.useCase.execute({ gestionPlanId: 3, periodoId: 6 })).paralelos).toEqual([]);
    expect(b.deps.parallelRepository.findAll).not.toHaveBeenCalled();
  });
});
