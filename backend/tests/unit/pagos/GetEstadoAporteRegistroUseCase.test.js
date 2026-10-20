import { jest } from '@jest/globals';
import { GetEstadoAporteRegistroUseCase } from '../../../src/application/use-cases/pagos/GetEstadoAporteRegistroUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetEstadoAporteRegistroUseCase', () => {
  const gestion = { id: 3, name: 'Gestión 2026', year: 2026 };

  const crear = () => {
    const deps = {
      contributionPaymentRepository: { findBy: jest.fn().mockResolvedValue(null) },
      contributionPaymentInstallmentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [] }),
      },
      paymentMethodRepository: { findById: jest.fn() },
      paymentAccountRepository: { findById: jest.fn() },
      managementRepository: {
        findById: jest.fn().mockResolvedValue(gestion),
        findBy: jest.fn().mockResolvedValue(gestion),
      },
      contributionConfigurationRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionConfigurations: [{ baseAmount: 500 }] }),
      },
      studentScholarshipRepository: { findBy: jest.fn().mockResolvedValue(null) },
      scholarshipRepository: { findById: jest.fn() },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetEstadoAporteRegistroUseCase(deps) };
  };

  it('exige el ID del estudiante', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
  });

  it('usa la gestión vigente si no se indica gestión', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ studentId: '7' });
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ vigente: true, isActive: true });
    expect(deps.contributionPaymentRepository.findBy).toHaveBeenCalledWith({ studentId: 7, managementId: 3 });
  });

  it('falla si no hay gestión vigente', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 7 })).rejects.toThrow('No hay una gestión vigente');
  });

  it('usa la gestión indicada y falla si no existe', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ studentId: 7, managementId: '3' });
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(3);

    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 7, managementId: 44 }))
      .rejects.toThrow('Gestión con ID 44 no encontrada');
  });

  describe('sin cabecera', () => {
    it('proyecta la deuda desde la configuración activa', async () => {
      const { useCase, deps } = crear();
      const r = await useCase.execute({ studentId: 7 });
      expect(deps.contributionConfigurationRepository.findAll)
        .toHaveBeenCalledWith({ managementId: 3, contributionActive: true }, 1, 1);
      expect(r).toEqual({
        cabecera: null,
        gestion: { id: 3, nombre: 'Gestión 2026', anio: 2026 },
        total_pagado: 0,
        cantidad_pagos: 0,
        saldo_pendiente: 500,
        monto_obligatorio: 500,
        monto_base: 500,
        descuento_beca: 0,
        tiene_descuento_aplicado: false,
        cuotas: [],
      });
    });

    it('usa 400 si no hay configuración', async () => {
      const { useCase, deps } = crear();
      deps.contributionConfigurationRepository.findAll.mockRejectedValue(new Error('db'));
      const r = await useCase.execute({ studentId: 7 });
      expect(r.monto_base).toBe(400);
      expect(r.saldo_pendiente).toBe(400);
    });

    it('aplica el porcentaje de la beca activa', async () => {
      const { useCase, deps } = crear();
      deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 8, scholarshipId: 2 });
      deps.scholarshipRepository.findById.mockResolvedValue({ percentage: 25 });
      const r = await useCase.execute({ studentId: 7 });
      expect(deps.studentScholarshipRepository.findBy)
        .toHaveBeenCalledWith({ studentId: 7, managementId: 3, estado: 'ACTIVA' });
      expect(r.descuento_beca).toBe(125);
      expect(r.monto_obligatorio).toBe(375);
      expect(r.tiene_descuento_aplicado).toBe(true);
    });
  });

  describe('con cabecera', () => {
    const cabecera = {
      id: 1,
studentId: 7,
managementId: 3,
baseAmount: 400,
scholarshipDiscount: 0,
      mandatoryAmount: 400,
state: 'PARCIAL',
    };

    it('suma cuotas, calcula saldo y resuelve método y cuenta de pago', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentRepository.findBy.mockResolvedValue(cabecera);
      deps.contributionPaymentInstallmentRepository.findAll.mockResolvedValue({
        contributionPaymentInstallments: [
          { id: 1, amount: 100, receiptNumber: 'R1', paymentMethodId: 2, paymentAccountId: 5, description: ' ' },
          { id: 2, amount: '50.5', receiptNumber: 'R2', paymentMethodId: 2, description: 'abono' },
        ],
      });
      deps.paymentMethodRepository.findById.mockResolvedValue({ name: 'QR', code: 'QR' });
      deps.paymentAccountRepository.findById.mockResolvedValue({ accountHolderName: 'INCOS', accountNumber: '123' });

      const r = await useCase.execute({ studentId: 7 });

      expect(deps.contributionPaymentInstallmentRepository.findAll)
        .toHaveBeenCalledWith({ contributionPaymentId: 1 }, 1, 5000);
      expect(r.total_pagado).toBe(150.5);
      expect(r.cantidad_pagos).toBe(2);
      expect(r.saldo_pendiente).toBe(249.5);
      expect(r.cabecera).toMatchObject({ id: 1, estudiante_id: 7, gestion_id: 3, estado: 'PARCIAL' });
      expect(deps.paymentMethodRepository.findById).toHaveBeenCalledTimes(1);
      expect(r.cuotas[0]).toMatchObject({
        numero_recibo: 'R1',
        observacion: null,
        metodo_pago: { nombre: 'QR', codigo: 'QR' },
        cuenta_pago: { nombre_titular: 'INCOS', numero_cuenta: '123', numero_celular: null },
      });
      expect(r.cuotas[1]).toMatchObject({ observacion: 'abono', cuenta_pago: null });
    });

    it('el saldo nunca es negativo', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentRepository.findBy.mockResolvedValue(cabecera);
      deps.contributionPaymentInstallmentRepository.findAll.mockResolvedValue({
        contributionPaymentInstallments: [{ id: 1, amount: 900 }],
      });
      const r = await useCase.execute({ studentId: 7 });
      expect(r.saldo_pendiente).toBe(0);
    });

    it('si falla la consulta de método de pago deja metodo_pago en null', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentRepository.findBy.mockResolvedValue(cabecera);
      deps.contributionPaymentInstallmentRepository.findAll.mockResolvedValue({
        contributionPaymentInstallments: [{ id: 1, amount: 10, paymentMethodId: 2 }],
      });
      deps.paymentMethodRepository.findById.mockRejectedValue(new Error('db'));
      const r = await useCase.execute({ studentId: 7 });
      expect(r.cuotas[0].metodo_pago).toBeNull();
    });

    it('marca descuento aplicado cuando la cabecera tiene descuento de beca', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentRepository.findBy.mockResolvedValue({ ...cabecera, scholarshipDiscount: 40 });
      const r = await useCase.execute({ studentId: 7 });
      expect(r.tiene_descuento_aplicado).toBe(true);
      expect(r.descuento_beca).toBe(40);
    });
  });
});
