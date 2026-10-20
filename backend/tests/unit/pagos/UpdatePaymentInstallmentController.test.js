import { jest } from '@jest/globals';
import { UpdatePaymentInstallmentController } from '../../../src/presentation/controllers/pagos/pagos-aportes/update-cuota.controller.js';

describe('UpdatePaymentInstallmentController', () => {
  const crear = () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ id: 11 }) };
    const responseFormatter = { updated: jest.fn().mockReturnValue('ok') };
    const controller = new UpdatePaymentInstallmentController({
      updatePaymentInstallmentUseCase: useCase,
      logger: {},
      responseFormatter,
    });
    return { controller, useCase, responseFormatter };
  };

  it('edición parcial: reenvía solo los campos presentes (no pisa cuenta, transacción ni comprobante con null)', async () => {
    const { controller, useCase } = crear();
    await controller.handle({ params: { id: '11' }, body: { amount: 25 } }, {}, jest.fn());
    expect(useCase.execute).toHaveBeenCalledWith(11, { amount: 25 });
  });

  it('un null explícito sí se reenvía para poder limpiar el campo', async () => {
    const { controller, useCase } = crear();
    await controller.handle(
      { params: { id: '11' }, body: { payment_account_id: null, descripcion: 'x' } },
      {},
      jest.fn()
    );
    expect(useCase.execute).toHaveBeenCalledWith(11, { payment_account_id: null, descripcion: 'x' });
  });

  it('delega los errores en next', async () => {
    const { controller, useCase } = crear();
    const error = new Error('boom');
    useCase.execute.mockRejectedValue(error);
    const next = jest.fn();
    await controller.handle({ params: { id: '11' }, body: {} }, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
