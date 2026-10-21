import { jest } from '@jest/globals';
import { DeleteCompromisoUseCase } from '../../../src/application/use-cases/pagos/DeleteCompromisoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeleteCompromisoUseCase', () => {
  const crear = () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 5 }),
      delete: jest.fn().mockResolvedValue(true),
    };
    const logger = { info: jest.fn() };
    return { repo, useCase: new DeleteCompromisoUseCase({ compromisoPagoRepository: repo, logger }) };
  };

  it('elimina el compromiso existente', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute('5', 3)).resolves.toBe(true);
    expect(repo.findById).toHaveBeenCalledWith(5);
    expect(repo.delete).toHaveBeenCalledWith(5, 3);
  });

  it('lanza NotFoundError si no existe y no elimina', async () => {
    const { useCase, repo } = crear();
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it.each([[0], [-2], ['abc'], [null], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });
});
