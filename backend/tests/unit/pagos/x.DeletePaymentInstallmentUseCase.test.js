import { jest } from '@jest/globals';
import { DeletePaymentInstallmentUseCase } from '../../../src/application/use-cases/pagos/DeletePaymentInstallmentUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeletePaymentInstallmentUseCase', () => {
  const crear = ({ restantes = [], obligatorio = 100 } = {}) => {
    const installmentRepo = {
      findById: jest.fn().mockResolvedValue({ id: 11, contributionPaymentId: 1 }),
      delete: jest.fn().mockResolvedValue(true),
      findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: restantes }),
    };
    const paymentRepo = {
      findById: jest.fn().mockResolvedValue({ id: 1, mandatoryAmount: obligatorio }),
      update: jest.fn().mockResolvedValue({}),
    };
    const logger = { info: jest.fn() };
    return {
      installmentRepo,
      paymentRepo,
      useCase: new DeletePaymentInstallmentUseCase({
        contributionPaymentInstallmentRepository: installmentRepo,
        contributionPaymentRepository: paymentRepo,
        logger,
      }),
    };
  };

  it('sin cuotas restantes deja la cabecera PENDIENTE', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    await useCase.execute(11);
    expect(installmentRepo.delete).toHaveBeenCalledWith(11);
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'PENDIENTE' });
  });

  it('con suma parcial deja PARCIAL', async () => {
    const { useCase, paymentRepo } = crear({ restantes: [{ amount: 30 }, { monto: '20.5' }] });
    await useCase.execute(11);
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'PARCIAL' });
  });

  it('con suma igual al obligatorio deja CANCELADO (tolerancia decimal)', async () => {
    const { useCase, paymentRepo } = crear({ restantes: [{ amount: 33.3 }, { amount: 66.7 }] });
    await useCase.execute(11);
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'CANCELADO' });
  });

  it('ignora montos no numéricos al sumar', async () => {
    const { useCase, paymentRepo } = crear({ restantes: [{ amount: 'abc' }, { amount: NaN }] });
    await useCase.execute(11);
    expect(paymentRepo.update).toHaveBeenCalledWith(1, { state: 'PENDIENTE' });
  });

  it.each([[0], [null], [undefined], ['x']])('rechaza id inválido %p', async (id) => {
    const { useCase, installmentRepo } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la cuota no existe', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    installmentRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute(11)).rejects.toBeInstanceOf(NotFoundError);
    expect(installmentRepo.delete).not.toHaveBeenCalled();
    expect(paymentRepo.update).not.toHaveBeenCalled();
  });

  it('rechaza una cuota ya eliminada', async () => {
    const { useCase, installmentRepo } = crear();
    installmentRepo.findById.mockResolvedValue({ id: 11, contributionPaymentId: 1, deletedAt: new Date() });
    await expect(useCase.execute(11)).rejects.toBeInstanceOf(ValidationError);
    expect(installmentRepo.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la cabecera no existe', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    paymentRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute(11)).rejects.toBeInstanceOf(NotFoundError);
    expect(installmentRepo.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el repositorio no logra eliminar y no actualiza estado', async () => {
    const { useCase, installmentRepo, paymentRepo } = crear();
    installmentRepo.delete.mockResolvedValue(false);
    await expect(useCase.execute(11)).rejects.toBeInstanceOf(NotFoundError);
    expect(paymentRepo.update).not.toHaveBeenCalled();
  });
});
