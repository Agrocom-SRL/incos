import { jest } from '@jest/globals';
import { DeleteAuthorizedBankUseCase } from '../../../src/application/use-cases/pagos/DeleteAuthorizedBankUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteAuthorizedBankUseCase', () => {
  const crear = (ok = true) => {
    const repo = { delete: jest.fn().mockResolvedValue(ok) };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new DeleteAuthorizedBankUseCase({ authorizedBankRepository: repo, logger }) };
  };

  it('elimina el banco', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, 9)).resolves.toBe(true);
    expect(repo.delete).toHaveBeenCalledWith(4, 9);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
