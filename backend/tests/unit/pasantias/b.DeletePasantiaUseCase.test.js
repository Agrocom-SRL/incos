import { describe, it, expect, jest } from '@jest/globals';
import { DeletePasantiaUseCase } from '../../../src/application/use-cases/pasantias/DeletePasantiaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const crear = (current = { id: 4 }) => {
  const pasantiaRepository = {
    findById: jest.fn().mockResolvedValue(current),
    delete: jest.fn().mockResolvedValue(true),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return { pasantiaRepository, logger, useCase: new DeletePasantiaUseCase({ pasantiaRepository, logger }) };
};

describe('DeletePasantiaUseCase', () => {
  it('elimina el trámite pasando id y usuario', async () => {
    const { useCase, pasantiaRepository, logger } = crear();
    await expect(useCase.execute(4, 7)).resolves.toBeUndefined();
    expect(pasantiaRepository.findById).toHaveBeenCalledWith(4);
    expect(pasantiaRepository.delete).toHaveBeenCalledWith(4, 7);
    expect(logger.info).toHaveBeenCalled();
  });

  it('userId por defecto es null', async () => {
    const { useCase, pasantiaRepository } = crear();
    await useCase.execute(4);
    expect(pasantiaRepository.delete).toHaveBeenCalledWith(4, null);
  });

  it('lanza NotFoundError si no existe y no elimina', async () => {
    const { useCase, pasantiaRepository } = crear(null);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaRepository.delete).not.toHaveBeenCalled();
  });
});
