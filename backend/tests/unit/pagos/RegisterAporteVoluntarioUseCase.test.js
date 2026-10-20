import { jest } from '@jest/globals';
import { RegisterAporteVoluntarioUseCase } from '../../../src/application/use-cases/pagos/RegisterAporteVoluntarioUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('RegisterAporteVoluntarioUseCase', () => {
  const gestion = { id: 3, year: 2026 };
  const cabeceraBase = {
    id: 1,
studentId: 7,
managementId: 3,
baseAmount: 400,
scholarshipDiscount: 0,
    mandatoryAmount: 400,
state: 'PENDIENTE',
  };

  const crear = ({ cabecera = cabeceraBase, pagado = [] } = {}) => {
    const deps = {
      contributionPaymentRepository: {
        findBy: jest.fn().mockResolvedValue(cabecera),
        create: jest.fn(async (d) => ({ id: 1, ...d })),
        update: jest.fn(),
      },
      contributionPaymentInstallmentRepository: {
        findAll: jest.fn().mockResolvedValue({
          contributionPaymentInstallments: pagado.map((amount, i) => ({ id: i + 100, amount })),
        }),
        create: jest.fn(async (d) => ({ id: 42, ...d })),
        update: jest.fn(),
      },
      paymentMethodRepository: {
        findById: jest.fn(async (id) => ({ id, nombre: `Metodo ${id}` })),
      },
      studentRepository: { findById: jest.fn().mockResolvedValue({ id: 7 }) },
      studentScholarshipRepository: { findBy: jest.fn().mockResolvedValue(null) },
      scholarshipRepository: { findById: jest.fn() },
      managementRepository: {
        findBy: jest.fn().mockResolvedValue(gestion),
        findById: jest.fn().mockResolvedValue(gestion),
      },
      contributionConfigurationRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionConfigurations: [] }),
      },
      upsertCompromisoUseCase: { execute: jest.fn() },
      compromisoPagoRepository: {
        findVigenteByPagoAporteId: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new RegisterAporteVoluntarioUseCase(deps) };
  };

  const pago = (extra = {}) => ({
    student_id: 7, amount: 100, payment_method_id: 1, payment_date: '2026-03-10', ...extra,
  });

  it('registra una cuota parcial: recibo definitivo, estado PARCIAL y compromiso automático', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(pago());

    expect(deps.contributionPaymentInstallmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      contributionPaymentId: 1,
      paymentDate: '2026-03-10',
      amount: 100,
      paymentMethodId: 1,
      paymentAccountId: null,
    }));
    expect(deps.contributionPaymentInstallmentRepository.update).toHaveBeenCalledWith(42, { receiptNumber: '000042' });
    expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(1, { state: 'PARCIAL' });
    expect(deps.upsertCompromisoUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
      pagoAporteId: 1,
      data: expect.objectContaining({ fechaCompromiso: '2026-06-08' }),
    }));
    expect(result.payment).toMatchObject({ id: 42, amount: 100, receiptNumber: '000042' });
    expect(result.reciboPDF).toBeUndefined();
  });

  it('respeta un plazo de compromiso permitido y descarta uno no permitido', async () => {
    const a = crear();
    await a.useCase.execute(pago({ compromiso_dias: 30 }));
    expect(a.deps.upsertCompromisoUseCase.execute.mock.calls[0][0].data.fechaCompromiso).toBe('2026-04-09');

    const b = crear();
    await b.useCase.execute(pago({ compromiso_dias: 7 }));
    expect(b.deps.upsertCompromisoUseCase.execute.mock.calls[0][0].data.fechaCompromiso).toBe('2026-06-08');
  });

  it('no genera compromiso en cuotas posteriores a la primera', async () => {
    const { useCase, deps } = crear({ cabecera: { ...cabeceraBase, state: 'PARCIAL' }, pagado: [100] });
    await useCase.execute(pago());
    expect(deps.upsertCompromisoUseCase.execute).not.toHaveBeenCalled();
    expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(1, { state: 'PARCIAL' });
  });

  it('al saldar el aporte pasa a CANCELADO y marca el compromiso vigente como CUMPLIDO', async () => {
    const { useCase, deps } = crear({ cabecera: { ...cabeceraBase, state: 'PARCIAL' }, pagado: [300] });
    deps.compromisoPagoRepository.findVigenteByPagoAporteId.mockResolvedValue({ id: 9 });
    await useCase.execute(pago({ amount: 100, userId: 2 }));
    expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(1, { state: 'CANCELADO' });
    expect(deps.compromisoPagoRepository.update).toHaveBeenCalledWith(9, { estado: 'CUMPLIDO' }, 2);
    expect(deps.upsertCompromisoUseCase.execute).not.toHaveBeenCalled();
  });

  it('rechaza un monto mayor al saldo pendiente', async () => {
    const { useCase, deps } = crear({ pagado: [350] });
    await expect(useCase.execute(pago({ amount: 100 }))).rejects.toThrow('no puede superar el saldo pendiente');
    expect(deps.contributionPaymentInstallmentRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un monto negativo', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(pago({ amount: -5 }))).rejects.toThrow('no puede ser negativo');
    expect(deps.contributionPaymentInstallmentRepository.create).not.toHaveBeenCalled();
  });

  it('exige la fecha de pago', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(pago({ payment_date: undefined }))).rejects.toBeInstanceOf(ValidationError);
    expect(deps.studentRepository.findById).not.toHaveBeenCalled();
  });

  it('exige el ID del estudiante y que exista', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(pago({ student_id: undefined }))).rejects.toBeInstanceOf(ValidationError);
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(pago())).rejects.toBeInstanceOf(NotFoundError);
  });

  it('acepta claves en camelCase', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ studentId: 7, amount: 50, paymentMethodId: 1, paymentDate: '2026-03-10' });
    expect(deps.contributionPaymentInstallmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50, paymentMethodId: 1 })
    );
  });

  it('usa la gestión indicada y falla con NotFoundError si no existe', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(pago({ management_id: '3' }));
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(3);

    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(pago({ management_id: 44 }))).rejects.toBeInstanceOf(NotFoundError);
  });

  it('falla si no hay gestión vigente', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute(pago())).rejects.toThrow('No hay una gestión vigente');
  });

  describe('método de pago', () => {
    it('EFECTIVO no admite cuenta de pago', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(pago({ payment_account_id: 5 }))).rejects.toThrow('EFECTIVO no debe tener cuenta');
    });

    it('QR exige código de comprobante', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(pago({ payment_method_id: 2 }))).rejects.toThrow('código de comprobante');
    });

    it('TRANSFERENCIA exige cuenta y comprobante', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(pago({ payment_method_id: 3, codigo_comprobante: 'X' })))
        .rejects.toThrow('cuenta de pago');
      await expect(useCase.execute(pago({ payment_method_id: 3, payment_account_id: 4 })))
        .rejects.toThrow('código de comprobante');
    });

    it('lanza NotFoundError si el método no existe', async () => {
      const { useCase, deps } = crear();
      deps.paymentMethodRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(pago({ payment_method_id: 99 }))).rejects.toBeInstanceOf(NotFoundError);
    });

    it('QR con comprobante guarda cuenta y transacción', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(pago({
        payment_method_id: 2, codigo_comprobante: 'CMP1', payment_account_id: 5, transaction_number: 'T9',
      }));
      expect(deps.contributionPaymentInstallmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        paymentMethodId: 2, paymentAccountId: 5, transactionNumber: 'T9', comprobanteCode: 'CMP1',
      }));
    });

    it('un pago gratuito en efectivo (monto 0) limpia cuenta y comprobante', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(pago({ amount: 0, codigo_comprobante: 'X', transaction_number: 'T' }));
      expect(deps.contributionPaymentInstallmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        amount: 0, paymentAccountId: null, transactionNumber: null, comprobanteCode: null,
      }));
    });
  });

  describe('cabecera inexistente', () => {
    it('la crea con 400 por defecto y con el descuento de la beca activa', async () => {
      const { useCase, deps } = crear({ cabecera: null });
      deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 8, scholarshipId: 2 });
      deps.scholarshipRepository.findById.mockResolvedValue({ percentage: 50 });
      await useCase.execute(pago({ amount: 100 }));
      expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith({
        studentId: 7,
        managementId: 3,
        studentScholarshipId: 8,
        baseAmount: 400,
        scholarshipDiscount: 200,
        mandatoryAmount: 200,
        state: 'PENDIENTE',
      });
    });

    it('sin beca la obligación es el monto base completo', async () => {
      const { useCase, deps } = crear({ cabecera: null });
      await useCase.execute(pago({ amount: 100 }));
      expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ scholarshipDiscount: 0, mandatoryAmount: 400, studentScholarshipId: null })
      );
    });
  });

  it('un fallo del compromiso no bloquea el registro del pago', async () => {
    const { useCase, deps } = crear();
    deps.upsertCompromisoUseCase.execute.mockRejectedValue(new Error('x'));
    const result = await useCase.execute(pago());
    expect(result.payment.id).toBe(42);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('registra y propaga errores del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentInstallmentRepository.create.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(pago())).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
