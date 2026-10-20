import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoActividadUseCase } from '../../../src/application/use-cases/configuracion/SetEstadoActividadUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoActividadUseCase', () => {
  const crear = ({ existing = { id: 7 }, updated = { id: 7, active: true } } = {}) => {
    const activityRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const logger = { info: jest.fn() };
    return { activityRepository, logger, useCase: new SetEstadoActividadUseCase({ activityRepository, logger }) };
  };

  it('actualiza solo el campo active y devuelve la presentación bajo "actividad"', async () => {
    const { useCase, activityRepository, logger } = crear({ updated: { id: 7, active: false } });
    const res = await useCase.execute(7, false, 4);
    expect(activityRepository.findById).toHaveBeenCalledWith(7);
    expect(activityRepository.update).toHaveBeenCalledWith(7, { active: false }, 4);
    expect(res.actividad).toMatchObject({ id: 7, activo: false });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7, activo: false });
  });

  it('reactiva (true) y usa userId null por defecto', async () => {
    const { useCase, activityRepository } = crear();
    const res = await useCase.execute(7, true);
    expect(activityRepository.update).toHaveBeenCalledWith(7, { active: true }, null);
    expect(res.actividad.activo).toBe(true);
  });

  it('coacciona 0 y 1 a boolean', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute(7, 0);
    expect(activityRepository.update).toHaveBeenLastCalledWith(7, { active: false }, null);
    await useCase.execute(7, 1);
    expect(activityRepository.update).toHaveBeenLastCalledWith(7, { active: true }, null);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, activityRepository, logger } = crear({ existing: null });
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(activityRepository.update).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al actualizar', async () => {
    const { useCase, activityRepository } = crear();
    activityRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(7, true)).rejects.toThrow('db');
  });
});
