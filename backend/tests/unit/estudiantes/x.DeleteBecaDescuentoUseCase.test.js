import { jest } from '@jest/globals';
import { DeleteBecaDescuentoUseCase } from '../../../src/application/use-cases/estudiantes/DeleteBecaDescuentoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteBecaDescuentoUseCase', () => {
  const crear = (deleteResult = true) => {
    const deps = {
      scholarshipRepository: { delete: jest.fn().mockResolvedValue(deleteResult) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteBecaDescuentoUseCase(deps) };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(3, 8)).resolves.toBe(true);
    expect(deps.scholarshipRepository.delete).toHaveBeenCalledWith(3, 8);
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('userId por defecto es null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(3);
    expect(deps.scholarshipRepository.delete).toHaveBeenCalledWith(3, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, deps } = crear(false);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
