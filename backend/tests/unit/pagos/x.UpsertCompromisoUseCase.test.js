import { jest } from '@jest/globals';
import { UpsertCompromisoUseCase } from '../../../src/application/use-cases/pagos/UpsertCompromisoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpsertCompromisoUseCase', () => {
  const crear = ({ cabecera = { id: 8 }, vigente = null } = {}) => {
    const compromisoRepo = {
      findVigenteByPagoAporteId: jest.fn().mockResolvedValue(vigente),
      delete: jest.fn().mockResolvedValue(true),
      create: jest.fn().mockResolvedValue({ id: 20 }),
    };
    const paymentRepo = { findById: jest.fn().mockResolvedValue(cabecera) };
    return {
      compromisoRepo,
      paymentRepo,
      useCase: new UpsertCompromisoUseCase({
        compromisoPagoRepository: compromisoRepo,
        contributionPaymentRepository: paymentRepo,
        logger: { info: jest.fn() },
      }),
    };
  };
  const data = { fechaCompromiso: '2026-06-01', observacion: ' nota ' };

  it('crea un compromiso VIGENTE sin anular nada si no había uno', async () => {
    const { useCase, compromisoRepo } = crear();
    const res = await useCase.execute({ pagoAporteId: '8', data, userId: 3 });
    expect(res).toEqual({ id: 20 });
    expect(compromisoRepo.delete).not.toHaveBeenCalled();
    expect(compromisoRepo.create).toHaveBeenCalledWith(
      { pagoAporteId: 8, fechaCompromiso: '2026-06-01', observacion: 'nota', estado: 'VIGENTE' },
      3
    );
  });

  it('renegociación: anula el vigente previo antes de crear el nuevo', async () => {
    const { useCase, compromisoRepo } = crear({ vigente: { id: 5 } });
    await useCase.execute({ pagoAporteId: 8, data, userId: 3 });
    expect(compromisoRepo.delete).toHaveBeenCalledWith(5, 3);
    expect(compromisoRepo.delete.mock.invocationCallOrder[0]).toBeLessThan(compromisoRepo.create.mock.invocationCallOrder[0]);
  });

  it('no registra sobre una cabecera inexistente', async () => {
    const { useCase, compromisoRepo } = crear({ cabecera: null });
    await expect(useCase.execute({ pagoAporteId: 8, data })).rejects.toBeInstanceOf(NotFoundError);
    expect(compromisoRepo.delete).not.toHaveBeenCalled();
    expect(compromisoRepo.create).not.toHaveBeenCalled();
  });

  it.each([[0], [-1], ['x'], [null]])('rechaza pagoAporteId inválido %p', async (id) => {
    const { useCase, paymentRepo } = crear();
    await expect(useCase.execute({ pagoAporteId: id, data })).rejects.toBeInstanceOf(ValidationError);
    expect(paymentRepo.findById).not.toHaveBeenCalled();
  });

  it.each([
    [undefined],
    [{}],
    [{ fechaCompromiso: '' }],
    [{ fechaCompromiso: 'mañana' }],
    [{ fechaCompromiso: '2026-13-40' }],
    [{ fechaCompromiso: '2026-06-01', observacion: 'x'.repeat(501) }],
  ])('rechaza datos inválidos %j sin tocar repositorios', async (d) => {
    const { useCase, compromisoRepo, paymentRepo } = crear({ vigente: { id: 5 } });
    await expect(useCase.execute({ pagoAporteId: 8, data: d })).rejects.toBeInstanceOf(ValidationError);
    expect(paymentRepo.findById).not.toHaveBeenCalled();
    expect(compromisoRepo.delete).not.toHaveBeenCalled();
    expect(compromisoRepo.create).not.toHaveBeenCalled();
  });

  it.each([['2026-02-31'], ['2026-04-31'], ['abc']])('rechaza fecha %p sin tocar nada', async (fecha) => {
    const { useCase, compromisoRepo } = crear({ vigente: { id: 5 } });
    await expect(useCase.execute({ pagoAporteId: 8, data: { fechaCompromiso: fecha } })).rejects.toBeInstanceOf(ValidationError);
    expect(compromisoRepo.delete).not.toHaveBeenCalled();
    expect(compromisoRepo.create).not.toHaveBeenCalled();
  });
});
