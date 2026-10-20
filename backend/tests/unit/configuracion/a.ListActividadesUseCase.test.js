import { describe, it, expect, jest } from '@jest/globals';
import { ListActividadesUseCase } from '../../../src/application/use-cases/configuracion/ListActividadesUseCase.js';

describe('ListActividadesUseCase', () => {
  const crear = (result = { activities: [], total: 0 }) => {
    const activityRepository = { findAll: jest.fn().mockResolvedValue(result) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { activityRepository, logger, useCase: new ListActividadesUseCase({ activityRepository, logger }) };
  };

  it('lista con paginación y expone la clave "actividades" (dataFieldName)', async () => {
    const { useCase, activityRepository } = crear({
      activities: [{ id: 1, name: 'Feria', type: 'FERIA', isHighlighted: true, active: true }],
      total: 25,
    });
    const res = await useCase.execute({ search: 'fe' }, 2, 10);
    expect(activityRepository.findAll).toHaveBeenCalledWith({ search: 'fe' }, 2, 10);
    expect(res).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
    expect(res.actividades).toHaveLength(1);
    expect(res.actividades[0]).toMatchObject({ id: 1, nombre: 'Feria', tipo: 'FERIA', esDestacada: true });
  });

  it('traduce filtros específicos: tipo, esDestacada e incluirInactivos', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({}, 1, 50, { tipo: 'FERIA', esDestacada: 'true', incluirInactivos: 'true' });
    expect(activityRepository.findAll).toHaveBeenCalledWith(
      { type: 'FERIA', isHighlighted: true, includeInactive: true },
      1,
      50
    );
  });

  it('esDestacada e incluirInactivos distintos de "true" resultan false', async () => {
    const { useCase } = crear();
    expect(useCase.buildSpecificFilters({ esDestacada: 'false', incluirInactivos: 'no' }, { search: 's' })).toEqual({
      search: 's',
      isHighlighted: false,
      includeInactive: false,
    });
    expect(useCase.buildSpecificFilters({ esDestacada: true, incluirInactivos: true })).toEqual({
      isHighlighted: true,
      includeInactive: true,
    });
  });

  it('page y limit no numéricos (NaN) caen en 1 y 50', async () => {
    const { useCase, activityRepository } = crear();
    const res = await useCase.execute({}, 'abc', 'xyz');
    expect(activityRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toMatchObject({ page: 1, limit: 50, totalPages: 0 });
  });

  it('propaga el error del repositorio y lo registra', async () => {
    const { useCase, activityRepository, logger } = crear();
    activityRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(logger.error).toHaveBeenCalled();
  });
});
