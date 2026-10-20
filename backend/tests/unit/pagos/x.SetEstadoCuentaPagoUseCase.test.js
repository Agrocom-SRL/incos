import { jest } from '@jest/globals';
import { SetEstadoCuentaPagoUseCase } from '../../../src/application/use-cases/pagos/SetEstadoCuentaPagoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoCuentaPagoUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4, active: false }),
    };
    const logger = { info: jest.fn() };
    return { repo, useCase: new SetEstadoCuentaPagoUseCase({ paymentAccountRepository: repo, logger }) };
  };

  it.each([[true], [false]])('actualiza el estado a %p y devuelve la presentación', async (activo) => {
    const { useCase, repo } = crear();
    const res = await useCase.execute(4, activo, 9);
    expect(repo.update).toHaveBeenCalledWith(4, { active: activo }, 9);
    expect(res.cuentaPago).toMatchObject({ id: 4, activo: false });
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
