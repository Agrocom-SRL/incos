import { describe, it, expect, jest } from '@jest/globals';
import { GetActividadByIdUseCase } from '../../../src/application/use-cases/configuracion/GetActividadByIdUseCase.js';

describe('GetActividadByIdUseCase', () => {
  const crear = (entity) => {
    const activityRepository = { findById: jest.fn().mockResolvedValue(entity) };
    return {
      activityRepository,
      useCase: new GetActividadByIdUseCase({ activityRepository, logger: { info: jest.fn() } }),
    };
  };

  it('devuelve la actividad en formato de presentación, incluyendo inactivas', async () => {
    const { useCase, activityRepository } = crear({
      id: 1,
      name: 'Feria',
      description: 'd',
      type: 'FERIA',
      isHighlighted: true,
      icon: 'star',
      active: false,
    });
    const res = await useCase.execute(1);
    expect(activityRepository.findById).toHaveBeenCalledWith(1, { paranoid: false });
    expect(res).toMatchObject({
      id: 1,
      nombre: 'Feria',
      descripcion: 'd',
      tipo: 'FERIA',
      esDestacada: true,
      icono: 'star',
      activo: false,
    });
  });

  it('devuelve null si no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(99)).resolves.toBeNull();
  });

  it('con id NaN delega al repositorio y devuelve null si no encuentra', async () => {
    const { useCase, activityRepository } = crear(null);
    await expect(useCase.execute(Number('abc'))).resolves.toBeNull();
    expect(activityRepository.findById).toHaveBeenCalledWith(NaN, { paranoid: false });
  });
});
