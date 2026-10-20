import { describe, it, expect, jest } from '@jest/globals';
import { DeletePeriodoUseCase } from '../../../src/application/use-cases/configuracion/DeletePeriodoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeletePeriodoUseCase', () => {
  const crear = (resultado) => {
    const periodRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return { periodRepository, logger, useCase: new DeletePeriodoUseCase({ periodRepository, logger }) };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, periodRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(periodRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, periodRepository } = crear(true);
    await useCase.execute(5);
    expect(periodRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('con id no numérico (NaN) delega al repositorio y respeta su resultado', async () => {
    const { useCase, periodRepository } = crear(false);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
    expect(periodRepository.delete).toHaveBeenCalledWith(NaN, null);
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, periodRepository } = crear(true);
    periodRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});
