import { jest } from '@jest/globals';
import { CreateStudentScholarshipUseCase } from '../../../src/application/use-cases/estudiantes/becas/CreateStudentScholarshipUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateStudentScholarshipUseCase', () => {
  const crear = ({ percentage = 50, cabecera = null, scholarship } = {}) => {
    const deps = {
      studentScholarshipRepository: {
        findBy: jest.fn().mockResolvedValue(null),
        create: jest.fn(async (e) => ({ id: 70, ...e.toPlainObject() })),
      },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
      scholarshipRepository: {
        findById: jest.fn().mockResolvedValue(scholarship === undefined ? { id: 2, name: 'Excelencia', percentage } : scholarship),
      },
      contributionConfigurationRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionConfigurations: [{ montoBase: 500 }] }),
      },
      contributionPaymentRepository: {
        findBy: jest.fn().mockResolvedValue(cabecera),
        create: jest.fn().mockResolvedValue({ id: 90 }),
        update: jest.fn().mockResolvedValue(true),
      },
      contributionPaymentInstallmentRepository: {
        create: jest.fn().mockResolvedValue({ id: 15 }),
        update: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateStudentScholarshipUseCase(deps) };
  };

  it('crea la asignación ACTIVA en la gestión vigente y crea la cabecera de pago con descuento', async () => {
    const { useCase, deps } = crear({ percentage: 50 });
    const res = await useCase.execute({ studentId: 5, scholarshipId: 2, observations: 'ok' });

    expect(deps.configuracionSistemaRepository.findBy).toHaveBeenCalledWith({ key: 'gestion_actual' });
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });
    expect(deps.studentScholarshipRepository.findBy).toHaveBeenCalledWith({ studentId: 5, scholarshipId: 2, managementId: 3 });
    const entidad = deps.studentScholarshipRepository.create.mock.calls[0][0];
    expect(entidad).toEqual(expect.objectContaining({ studentId: 5, scholarshipId: 2, managementId: 3, state: 'ACTIVA', observations: 'ok' }));
    expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 5,
        managementId: 3,
        studentScholarshipId: 70,
        baseAmount: 500,
        scholarshipDiscount: 250,
        mandatoryAmount: 250,
        state: 'PENDIENTE',
      })
    );
    expect(res.studentScholarship).toEqual(expect.objectContaining({ id: 70, estudianteId: 5, becaDescuentoId: 2, estado: 'ACTIVA' }));
    expect(res).toEqual(expect.objectContaining({ pagoAporteId: 90, esBeca100: false }));
    expect(deps.contributionPaymentInstallmentRepository.create).not.toHaveBeenCalled();
  });

  it('si ya existe cabecera de pago la actualiza en lugar de crearla', async () => {
    const { useCase, deps } = crear({ percentage: 25, cabecera: { id: 91 } });
    const res = await useCase.execute({ studentId: 5, scholarshipId: 2 });
    expect(deps.contributionPaymentRepository.create).not.toHaveBeenCalled();
    expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(91, {
      studentScholarshipId: 70,
      scholarshipDiscount: 125,
      mandatoryAmount: 375,
    });
    expect(res.pagoAporteId).toBe(91);
  });

  it('beca 100%: registra cuota 0, normaliza el recibo y marca el aporte CANCELADO', async () => {
    const { useCase, deps } = crear({ percentage: 100 });
    const res = await useCase.execute({ studentId: 5, scholarshipId: 2, observations: ' Motivo social ' });

    expect(deps.contributionPaymentInstallmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ contributionPaymentId: 90, amount: 0, description: 'Motivo social' })
    );
    expect(deps.contributionPaymentInstallmentRepository.update).toHaveBeenCalledWith(15, { receiptNumber: '000015' });
    expect(deps.contributionPaymentRepository.update).toHaveBeenCalledWith(90, { state: 'CANCELADO' });
    expect(res.esBeca100).toBe(true);
  });

  it('beca 100% sin observaciones genera la descripción con nombre de beca', async () => {
    const { useCase, deps } = crear({ percentage: 100 });
    await useCase.execute({ studentId: 5, scholarshipId: 2 });
    const { description } = deps.contributionPaymentInstallmentRepository.create.mock.calls[0][0];
    expect(description).toMatch(/^Beca Excelencia - \d{2}\/\d{2}\/\d{4}$/);
  });

  it('usa monto base 400 si falla la configuración de aportes', async () => {
    const { useCase, deps } = crear({ percentage: 50 });
    deps.contributionConfigurationRepository.findAll.mockRejectedValue(new Error('x'));
    await useCase.execute({ studentId: 5, scholarshipId: 2 });
    expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseAmount: 400, scholarshipDiscount: 200, mandatoryAmount: 200 })
    );
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('si el tipo de beca no existe, crea la asignación pero no toca pagos', async () => {
    const { useCase, deps } = crear({ scholarship: null });
    const res = await useCase.execute({ studentId: 5, scholarshipId: 2 });
    expect(deps.contributionPaymentRepository.create).not.toHaveBeenCalled();
    expect(res.pagoAporteId).toBeNull();
    expect(res.esBeca100).toBe(false);
  });

  it('rechaza una asignación duplicada (mismo estudiante, beca y gestión)', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findBy.mockResolvedValue({ id: 1 });
    await expect(useCase.execute({ studentId: 5, scholarshipId: 2 })).rejects.toThrow(ValidationError);
    expect(deps.studentScholarshipRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si falta la configuración gestion_actual', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 5, scholarshipId: 2 })).rejects.toThrow(NotFoundError);
    expect(deps.studentScholarshipRepository.create).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si la gestión configurada no es un año (NaN)', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    await expect(useCase.execute({ studentId: 5, scholarshipId: 2 })).rejects.toThrow(ValidationError);
    expect(deps.managementRepository.findBy).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no hay gestión vigente para el año', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 5, scholarshipId: 2 })).rejects.toThrow(NotFoundError);
  });
});
