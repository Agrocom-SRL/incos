import { describe, it, expect, jest } from '@jest/globals';
import { ListActividadesUseCase } from '../../../src/application/use-cases/configuracion/ListActividadesUseCase.js';

describe('ListActividadesUseCase', () => {
  const crear = (result = { activities: [{ id: 1, name: 'X' }], total: 1 }) => {
    const activityRepository = { findAll: jest.fn().mockResolvedValue(result) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { activityRepository, logger, useCase: new ListActividadesUseCase({ activityRepository, logger }) };
  };

  it('devuelve la página bajo "actividades" con metadatos de paginación', async () => {
    const { useCase, activityRepository } = crear({ activities: [{ id: 1, name: 'X' }], total: 21 });
    const res = await useCase.execute({ search: 'x' }, 2, 10);
    expect(activityRepository.findAll).toHaveBeenCalledWith({ search: 'x' }, 2, 10);
    expect(res.actividades).toHaveLength(1);
    expect(res).toMatchObject({ total: 21, page: 2, limit: 10, totalPages: 3 });
  });

  it('usa page 1 / limit 50 cuando llegan valores no numéricos (NaN)', async () => {
    const { useCase, activityRepository } = crear();
    const res = await useCase.execute({}, 'abc', 'xyz');
    expect(activityRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toMatchObject({ page: 1, limit: 50 });
  });

  it('devuelve lista vacía si falta la colección', async () => {
    const { useCase } = crear({ total: 0 });
    const res = await useCase.execute({}, 1, 10);
    expect(res.actividades).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('sin queryParams no agrega filtros específicos', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({ a: 1 }, 1, 10, {});
    expect(activityRepository.findAll).toHaveBeenCalledWith({ a: 1 }, 1, 10);
  });
  it('traduce incluirInactivos a includeInactive', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'true' });
    expect(activityRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: 'false' });
    expect(activityRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: false }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: true });
    expect(activityRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
  });
  it('traduce tipo y esDestacada a filtros de dominio', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({ search: 's' }, 1, 10, { tipo: 'FERIADO', esDestacada: 'true' });
    expect(activityRepository.findAll).toHaveBeenLastCalledWith(
      { search: 's', type: 'FERIADO', isHighlighted: true }, 1, 10);
    await useCase.execute({}, 1, 10, { esDestacada: 'false' });
    expect(activityRepository.findAll).toHaveBeenLastCalledWith({ isHighlighted: false }, 1, 10);
  });

  it('registra y propaga el error del repositorio', async () => {
    const { useCase, activityRepository, logger } = crear();
    activityRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('db');
    expect(logger.error).toHaveBeenCalled();
  });
});
