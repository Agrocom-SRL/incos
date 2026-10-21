import { jest } from '@jest/globals';
import { CreatePaymentAccountUseCase } from '../../../src/application/use-cases/pagos/CreatePaymentAccountUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePaymentAccountUseCase', () => {
  const crear = () => {
    const repo = { create: jest.fn().mockResolvedValue({ id: 3 }) };
    const logger = { info: jest.fn() };
    return { repo, useCase: new CreatePaymentAccountUseCase({ paymentAccountRepository: repo, logger }) };
  };

  it('crea la cuenta normalizando ids y titular', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({
      body: { nombre_titular: ' Ana ', metodo_pago_id: '2', banco_id: 4, numero_cuenta: '123', numero_celular: '777' },
      userId: 8,
    });
    expect(res).toEqual({ id: 3 });
    expect(repo.create).toHaveBeenCalledWith(
      {
        paymentMethodId: 2,
        bankId: 4,
        accountHolderName: 'Ana',
        accountNumber: '123',
        phoneNumber: '777',
        qrImageUrl: null,
        active: true,
      },
      8
    );
  });

  it('usa la ruta pública del archivo QR subido por encima del body', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ body: { nombre_titular: 'A', qr_imagen_url: '/otra' }, qrFile: { filename: 'q.png' } });
    expect(repo.create.mock.calls[0][0].qrImageUrl).toBe('/uploads/cuentas-pago/qr/q.png');
  });

  it('respeta qr del body si no hay archivo', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ body: { nombre_titular: 'A', qrImageUrl: '/x.png' } });
    expect(repo.create.mock.calls[0][0].qrImageUrl).toBe('/x.png');
  });

  it.each([[{}], [{ nombre_titular: '   ' }], [{ nombre_titular: null }]])(
    'rechaza titular vacío %j',
    async (body) => {
      const { useCase, repo } = crear();
      await expect(useCase.execute({ body })).rejects.toBeInstanceOf(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    }
  );
});
