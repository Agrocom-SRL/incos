import { describe, it, expect, jest } from '@jest/globals';
import { ListPlanesEstudiosUseCase } from '../../../src/application/use-cases/configuracion/ListPlanesEstudiosUseCase.js';

describe('ListPlanesEstudiosUseCase', () => {
  const crear = (result = { studyPlans: [{ id: 1, name: 'X' }], total: 1 }) => {
    const studyPlanRepository = { findAll: jest.fn().mockResolvedValue(result) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { studyPlanRepository, logger, useCase: new ListPlanesEstudiosUseCase({ studyPlanRepository, logger }) };
  };

  it('devuelve la página bajo "planes_estudios" con metadatos de paginación', async () => {
    const { useCase, studyPlanRepository } = crear({ studyPlans: [{ id: 1, name: 'X' }], total: 21 });
    const res = await useCase.execute({ search: 'x' }, 2, 10);
    expect(studyPlanRepository.findAll).toHaveBeenCalledWith({ search: 'x' }, 2, 10);
    expect(res.planes_estudios).toHaveLength(1);
    expect(res).toMatchObject({ total: 21, page: 2, limit: 10, totalPages: 3 });
  });

  it('usa page 1 / limit 50 cuando llegan valores no numéricos (NaN)', async () => {
    const { useCase, studyPlanRepository } = crear();
    const res = await useCase.execute({}, 'abc', 'xyz');
    expect(studyPlanRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toMatchObject({ page: 1, limit: 50 });
  });

  it('devuelve lista vacía si falta la colección', async () => {
    const { useCase } = crear({ total: 0 });
    const res = await useCase.execute({}, 1, 10);
    expect(res.planes_estudios).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('sin queryParams no agrega filtros específicos', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute({ a: 1 }, 1, 10, {});
    expect(studyPlanRepository.findAll).toHaveBeenCalledWith({ a: 1 }, 1, 10);
  });
  it('traduce incluirInactivos a includeInactive', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'true' });
    expect(studyPlanRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: 'false' });
    expect(studyPlanRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: false }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: true });
    expect(studyPlanRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
  });
  it('registra y propaga el error del repositorio', async () => {
    const { useCase, studyPlanRepository, logger } = crear();
    studyPlanRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('db');
    expect(logger.error).toHaveBeenCalled();
  });
});
