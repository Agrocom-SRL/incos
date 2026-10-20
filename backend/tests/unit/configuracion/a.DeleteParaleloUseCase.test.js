import { describe, it, expect, jest } from '@jest/globals';
import { DeleteParaleloUseCase } from '../../../src/application/use-cases/configuracion/DeleteParaleloUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeleteParaleloUseCase', () => {
  const crear = ({ current = { id: 5 }, refs = 0, deleted = true } = {}) => {
    const parallelRepository = {
      findById: jest.fn().mockResolvedValue(current),
      delete: jest.fn().mockResolvedValue(deleted),
    };
    const parallelManagementRepository = { count: jest.fn().mockResolvedValue(refs) };
    const logger = { info: jest.fn() };
    return {
      parallelRepository,
      parallelManagementRepository,
      logger,
      useCase: new DeleteParaleloUseCase({ parallelRepository, parallelManagementRepository, logger }),
    };
  };

  it('elimina un paralelo sin referencias', async () => {
    const { useCase, parallelRepository, parallelManagementRepository, logger } = crear();
    await expect(useCase.execute(5, 2)).resolves.toBe(true);
    expect(parallelManagementRepository.count).toHaveBeenCalledWith({ parallelId: 5 });
    expect(parallelRepository.delete).toHaveBeenCalledWith(5, 2);
    expect(logger.info).toHaveBeenCalledWith('[CFG] Paralelo maestro eliminado', { id: 5 });
  });

  it('usa userId null por defecto', async () => {
    const { useCase, parallelRepository } = crear();
    await useCase.execute(5);
    expect(parallelRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el paralelo no existe', async () => {
    const { useCase, parallelManagementRepository, parallelRepository } = crear({ current: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(parallelManagementRepository.count).not.toHaveBeenCalled();
    expect(parallelRepository.delete).not.toHaveBeenCalled();
  });

  it('con id NaN el repositorio no lo encuentra y falla con NotFoundError', async () => {
    const { useCase, parallelRepository } = crear({ current: null });
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
    expect(parallelRepository.findById).toHaveBeenCalledWith(NaN);
  });

  it('rechaza si está referenciado en alguna gestión', async () => {
    const { useCase, parallelRepository, logger } = crear({ refs: 2 });
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ValidationError);
    expect(parallelRepository.delete).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el borrado no afecta filas', async () => {
    const { useCase, logger } = crear({ deleted: false });
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
