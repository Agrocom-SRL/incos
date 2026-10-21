import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoParaleloUseCase } from '../../../src/application/use-cases/configuracion/SetEstadoParaleloUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoParaleloUseCase', () => {
  const crear = ({ existing = { id: 7 }, updated = { id: 7, active: true } } = {}) => {
    const parallelRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const logger = { info: jest.fn() };
    return { parallelRepository, logger, useCase: new SetEstadoParaleloUseCase({ parallelRepository, logger }) };
  };

  it('actualiza solo el campo active y devuelve la presentación bajo "paralelo"', async () => {
    const { useCase, parallelRepository, logger } = crear({ updated: { id: 7, active: false } });
    const res = await useCase.execute(7, false, 4);
    expect(parallelRepository.findById).toHaveBeenCalledWith(7);
    expect(parallelRepository.update).toHaveBeenCalledWith(7, { active: false }, 4);
    expect(res.paralelo).toMatchObject({ id: 7, activo: false });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7, activo: false });
  });

  it('reactiva (true) y usa userId null por defecto', async () => {
    const { useCase, parallelRepository } = crear();
    const res = await useCase.execute(7, true);
    expect(parallelRepository.update).toHaveBeenCalledWith(7, { active: true }, null);
    expect(res.paralelo.activo).toBe(true);
  });

  it('coacciona 0 y 1 a boolean', async () => {
    const { useCase, parallelRepository } = crear();
    await useCase.execute(7, 0);
    expect(parallelRepository.update).toHaveBeenLastCalledWith(7, { active: false }, null);
    await useCase.execute(7, 1);
    expect(parallelRepository.update).toHaveBeenLastCalledWith(7, { active: true }, null);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, parallelRepository, logger } = crear({ existing: null });
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(parallelRepository.update).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al actualizar', async () => {
    const { useCase, parallelRepository } = crear();
    parallelRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(7, true)).rejects.toThrow('db');
  });
});
