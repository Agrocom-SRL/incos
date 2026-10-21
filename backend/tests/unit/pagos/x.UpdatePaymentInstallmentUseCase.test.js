import { jest } from '@jest/globals';
import { UpdatePaymentInstallmentUseCase } from '../../../src/application/use-cases/pagos/UpdatePaymentInstallmentUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePaymentInstallmentUseCase', () => {
  const cuotaActual = {
    id: 11,
    contributionPaymentId: 1,
    amount: 40,
    paymentDate: '2026-03-01',
    paymentMethodId: 1,
    paymentAccountId: null,
  };

  const crear = ({ cuota = cuotaActual, cabecera = { id: 1, mandatoryAmount: 100 }, otras = [], metodo = { id: 1, name: 'Efectivo' } } = {}) => {
    const installmentRepo = {
      findById: jest.fn().mockResolvedValue(cuota),
      findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [cuotaActual, ...otras] }),
      update: jest.fn().mockImplementation(async (_id, payload) => ({ id: 11, ...payload })),
    };
    const paymentRepo = {
      findById: jest.fn().mockResolvedValue(cabecera),
      update: jest.fn().mockResolvedValue({}),
    };
    const methodRepo = { findById: jest.fn().mockResolvedValue(metodo) };
    return {
      installmentRepo,
      paymentRepo,
      methodRepo,
      useCase: new UpdatePaymentInstallmentUseCase({
        contributionPaymentInstallmentRepository: installmentRepo,
        contributionPaymentRepository: paymentRepo,
        paymentMethodRepository: methodRepo,
        logger: { info: jest.fn() },
      }),
    };
  };

  it('actualiza el monto en efectivo y deja la cabecera PARCIAL', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear({ otras: [{ id: 12, amount: 20 }] });
    const res = await useCase.execute(11, { amount: 50 });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({
      amount: 50,
      paymentDate: '2026-03-01',
      paymentMethodId: 1,
      paymentAccountId: null,
    }));
    expect(res.amount).toBe(50);
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'PARCIAL' });
  });

  it('excluye la cuota editada de la suma de otras cuotas', async () => {
    // otras = 20; editada 80 => 100 exacto => CANCELADO (si contara la vieja de 40 sería 140 y fallaría)
    const { useCase, paymentRepo } = crear({ otras: [{ id: 12, amount: 20 }] });
    await useCase.execute(11, { amount: 80 });
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'CANCELADO' });
  });

  it('rechaza un monto que excede el obligatorio sin modificar nada', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear({ otras: [{ id: 12, amount: 20 }] });
    await expect(useCase.execute(11, { amount: 80.01 })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
    expect(paymentRepo.update).not.toHaveBeenCalled();
  });

  it('acepta sumas decimales que igualan el obligatorio (tolerancia)', async () => {
    const { useCase, paymentRepo } = crear({ otras: [{ id: 12, amount: 0.1 }, { id: 13, amount: 0.2 }], cabecera: { id: 1, mandatoryAmount: 0.6 } });
    await useCase.execute(11, { amount: 0.3 });
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'CANCELADO' });
  });

  it.each([[-1], ['abc'], [NaN]])('rechaza monto inválido %p', async (amount) => {
    const { useCase, installmentRepo } = crear();
    await expect(useCase.execute(11, { amount })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it('monto cero en efectivo limpia cuenta, transacción y comprobante', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    await useCase.execute(11, { amount: 0, payment_account_id: 5, transaction_number: 'T', codigo_comprobante: 'C' });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({
      amount: 0, paymentMethodId: 1, paymentAccountId: null, transactionNumber: null, comprobanteCode: null,
    }));
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'PENDIENTE' });
  });

  it('EFECTIVO con cuenta de pago es inválido', async () => {
    const { useCase, installmentRepo } = crear();
    await expect(useCase.execute(11, { amount: 10, payment_account_id: 5 })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it('método 2 exige código de comprobante', async () => {
    const { useCase, installmentRepo } = crear({ metodo: { id: 2, name: 'Depósito' } });
    await expect(useCase.execute(11, { amount: 10, payment_method_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    await useCase.execute(11, { amount: 10, payment_method_id: 2, codigo_comprobante: ' C1 ' });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({ paymentMethodId: 2, comprobanteCode: 'C1' }));
  });

  it.each([3, 4])('método %i exige cuenta y comprobante', async (mid) => {
    const { useCase, installmentRepo } = crear({ metodo: { id: mid, name: 'M' } });
    await expect(useCase.execute(11, { amount: 10, payment_method_id: mid, codigo_comprobante: 'C' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(11, { amount: 10, payment_method_id: mid, payment_account_id: 3 })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
    await useCase.execute(11, { amount: 10, payment_method_id: mid, payment_account_id: '3', codigo_comprobante: 'C' });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({ paymentAccountId: 3, comprobanteCode: 'C' }));
  });

  it('método de pago inexistente lanza NotFoundError', async () => {
    const { useCase, installmentRepo } = crear({ metodo: null });
    await expect(useCase.execute(11, { amount: 10, payment_method_id: 2, codigo_comprobante: 'C' })).rejects.toBeInstanceOf(NotFoundError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it('método de pago no soportado es inválido', async () => {
    const { useCase } = crear({ metodo: { id: 9, name: 'X' } });
    await expect(useCase.execute(11, { amount: 10, payment_method_id: 9 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('normaliza la fecha de pago a YYYY-MM-DD', async () => {
    const { useCase, installmentRepo } = crear();
    await useCase.execute(11, { amount: 10, payment_date: '2026-04-05T12:00:00Z' });
    expect(installmentRepo.update.mock.calls[0][1].paymentDate).toBe('2026-04-05');
  });

  it('exige fecha de pago cuando ni el dato ni la cuota la tienen', async () => {
    const { useCase } = crear({ cuota: { ...cuotaActual, paymentDate: null } });
    await expect(useCase.execute(11, { amount: 10 })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[0], [null], [undefined], ['x']])('rechaza id de cuota inválido %p', async (id) => {
    const { useCase, installmentRepo } = crear();
    await expect(useCase.execute(id, { amount: 1 })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la cuota no existe', async () => {
    const { useCase, installmentRepo } = crear({ cuota: null });
    await expect(useCase.execute(11, { amount: 1 })).rejects.toBeInstanceOf(NotFoundError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it('rechaza una cuota eliminada', async () => {
    const { useCase, installmentRepo } = crear({ cuota: { ...cuotaActual, deletedAt: new Date() } });
    await expect(useCase.execute(11, { amount: 1 })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la cabecera no existe', async () => {
    const { useCase, installmentRepo } = crear({ cabecera: null });
    await expect(useCase.execute(11, { amount: 1 })).rejects.toBeInstanceOf(NotFoundError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
  });

  it.each([[''], ['   '], ['abc'], [-1]])('rechaza monto %p sin modificar nada (no se vuelve cuota gratuita)', async (amount) => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    await expect(useCase.execute(11, { amount })).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.update).not.toHaveBeenCalled();
    expect(paymentRepo.update).not.toHaveBeenCalled();
  });

  it('un monto 0 explícito sigue siendo válido (cuota gratuita con compromiso)', async () => {
    const { useCase, installmentRepo } = crear();
    await useCase.execute(11, { amount: 0 });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({ amount: 0 }));
  });

  it('sin monto en el payload conserva el de la cuota', async () => {
    const { useCase, installmentRepo } = crear();
    await useCase.execute(11, { descripcion: 'nota' });
    expect(installmentRepo.update).toHaveBeenCalledWith(11, expect.objectContaining({ amount: 40 }));
  });
});
