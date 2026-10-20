import { jest } from '@jest/globals';
import { CreateAuthorizedBankUseCase } from '../../../src/application/use-cases/pagos/CreateAuthorizedBankUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateAuthorizedBankUseCase', () => {
  const crear = () => {
    const repo = { create: jest.fn().mockResolvedValue({ id: 5 }) };
    const logger = { info: jest.fn() };
    return { repo, useCase: new CreateAuthorizedBankUseCase({ authorizedBankRepository: repo, logger }) };
  };

  it('crea el banco normalizando código y nombre', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ codigo: ' BNB ', nombre: ' Banco Nacional ', metodo_pago_id: '3' }, 9);
    expect(res).toEqual({ id: 5 });
    expect(repo.create).toHaveBeenCalledWith(
      { paymentMethodId: 3, code: 'BNB', name: 'Banco Nacional', active: true },
      9
    );
  });

  it('acepta alias en inglés y metodo de pago nulo', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ code: 'X', name: 'Y', active: false });
    expect(repo.create).toHaveBeenCalledWith(
      { paymentMethodId: null, code: 'X', name: 'Y', active: false },
      null
    );
  });

  it.each([[{}], [{ codigo: '  ', nombre: 'a' }], [{ codigo: null, nombre: 'a' }]])(
    'rechaza código vacío %j',
    async (body) => {
      const { useCase, repo } = crear();
      await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    }
  );

  it('rechaza nombre vacío', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ codigo: 'A', nombre: '   ' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
