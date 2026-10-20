import { jest } from '@jest/globals';
import { UpdatePaymentMethodUseCase } from '../../../src/application/use-cases/pagos/UpdatePaymentMethodUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePaymentMethodUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4 }),
    };
    return { repo, useCase: new UpdatePaymentMethodUseCase({ paymentMethodRepository: repo, logger: { info: jest.fn() } }) };
  };

  it('actualiza nombre y estado', async () => {
    const { useCase, repo } = crear();
    await useCase.execute('4', { nombre: ' Efectivo ', activo: true }, 2);
    expect(repo.update).toHaveBeenCalledWith(4, { name: 'Efectivo', active: true }, 2);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(4, { nombre: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[0], ['x'], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute(id, { nombre: 'x' })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[{ nombre: '  ' }], [{}]])('rechaza payload inválido %j', async (body) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, body)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
