import { jest } from '@jest/globals';
import { DeletePaymentAccountUseCase } from '../../../src/application/use-cases/pagos/DeletePaymentAccountUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeletePaymentAccountUseCase', () => {
  const crear = (ok = true) => {
    const repo = { delete: jest.fn().mockResolvedValue(ok) };
    const logger = { info: jest.fn() };
    return { repo, useCase: new DeletePaymentAccountUseCase({ paymentAccountRepository: repo, logger }) };
  };

  it('elimina la cuenta', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, 9)).resolves.toBe(true);
    expect(repo.delete).toHaveBeenCalledWith(4, 9);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
