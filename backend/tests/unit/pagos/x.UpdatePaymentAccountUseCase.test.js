import { jest } from '@jest/globals';
import { UpdatePaymentAccountUseCase } from '../../../src/application/use-cases/pagos/UpdatePaymentAccountUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePaymentAccountUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4 }),
    };
    return { repo, useCase: new UpdatePaymentAccountUseCase({ paymentAccountRepository: repo, logger: { info: jest.fn() } }) };
  };

  it('actualiza los campos enviados normalizados', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({
      id: '4',
      body: { nombre_titular: ' Ana ', metodo_pago_id: '2', banco_id: '', numero_cuenta: '', numero_celular: '77', activo: false },
      userId: 3,
    });
    expect(repo.update).toHaveBeenCalledWith(
      4,
      { accountHolderName: 'Ana', paymentMethodId: 2, bankId: null, accountNumber: null, phoneNumber: '77', active: false },
      3
    );
  });

  it('el archivo QR tiene prioridad sobre el body', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ id: 4, body: { qr_imagen_url: '/old' }, qrFile: { filename: 'n.png' } });
    expect(repo.update.mock.calls[0][1]).toEqual({ qrImageUrl: '/uploads/cuentas-pago/qr/n.png' });
  });

  it('permite quitar el QR enviando cadena vacía', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ id: 4, body: { qrImageUrl: '' } });
    expect(repo.update.mock.calls[0][1]).toEqual({ qrImageUrl: null });
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute({ id: 4, body: { activo: true } })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[0], ['x'], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute({ id, body: { activo: true } })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[{ nombre_titular: ' ' }], [{}]])('rechaza payload inválido %j', async (body) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ id: 4, body })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
