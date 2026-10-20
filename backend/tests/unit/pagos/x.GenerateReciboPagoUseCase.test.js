import { jest } from '@jest/globals';
import fs from 'fs';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const mockSave = jest.fn((scope, fileName) => ({
  filePath: `/uploads/${scope}/${fileName}`,
  fileName,
  absolutePath: `/abs/${scope}/${fileName}`,
}));
jest.unstable_mockModule('../../../src/infrastructure/external/storage/UploadsStorageHelper.js', () => ({
  UploadsStorageHelper: { saveToUploads: mockSave },
}));

const { GenerateReciboPagoUseCase } = await import(
  '../../../src/application/use-cases/pagos/GenerateReciboPagoUseCase.js'
);

describe('GenerateReciboPagoUseCase', () => {
  const cabecera = {
    id: 1,
    studentId: 7,
    managementId: 2,
    baseAmount: 200,
    scholarshipDiscount: 50,
    mandatoryAmount: 150,
    studentScholarshipId: 9,
  };
  const cuotas = [
    { id: 11, contributionPaymentId: 1, amount: 40, paymentMethodId: 1, receiptNumber: 'REC-1-1', paymentDate: '2026-03-01' },
    { id: 12, contributionPaymentId: 1, amount: 60.5, paymentMethodId: 1, receiptNumber: 'REC-1-2', paymentDate: '2026-04-01', description: ' obs ' },
  ];

  const crear = (over = {}) => {
    const deps = {
      contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(cabecera) },
      contributionPaymentInstallmentRepository: {
        findById: jest.fn().mockImplementation(async (id) => cuotas.find((c) => c.id === id) ?? null),
        findBy: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [cuotas[1], cuotas[0]] }),
      },
      studentRepository: { findById: jest.fn().mockResolvedValue({ id: 7, lastName: 'Paz', motherLastName: 'Lima', firstName: 'Ana', ci: '123', studentCode: 'E7' }) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2, year: 2026 }) },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue({ id: 1, name: 'Efectivo' }) },
      studentScholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 9, scholarshipId: 3 }) },
      scholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 3, name: 'Beca', percentage: 25 }) },
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }),
        create: jest.fn().mockResolvedValue({ id: 77 }),
        update: jest.fn().mockResolvedValue({ id: 77 }),
      },
      pdfGenerator: { generateReciboPago: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...over,
    };
    return { deps, useCase: new GenerateReciboPagoUseCase(deps) };
  };

  beforeEach(() => mockSave.mockClear());
  afterEach(() => jest.restoreAllMocks());

  describe('recibo por cuota', () => {
    it('genera el PDF con saldo y total pagado acumulado hasta esa cuota', async () => {
      const { useCase, deps } = crear();
      const res = await useCase.execute(12);
      const data = deps.pdfGenerator.generateReciboPago.mock.calls[0][0];
      expect(data).toMatchObject({
        numeroRecibo: 'REC-1-2',
        nombreCompleto: 'PAZ LIMA ANA',
        montoTotal: 200,
        descuentoBeca: 50,
        montoObligatorio: 150,
        totalPagadoAntes: 40,
        montoPagado: 60.5,
        saldoPendiente: 49.5,
        metodoPago: 'Efectivo',
        observacion: 'obs',
        becaInfo: { nombre: 'Beca', porcentaje: 25 },
      });
      expect(mockSave).toHaveBeenCalledWith('recibos/2026', 'pago_E7_REC-1-2.pdf', expect.any(Buffer));
      expect(res).toEqual({
        filePath: '/uploads/recibos/2026/pago_E7_REC-1-2.pdf',
        fileName: 'pago_E7_REC-1-2.pdf',
        absolutePath: '/abs/recibos/2026/pago_E7_REC-1-2.pdf',
      });
    });

    it('el saldo pendiente nunca es negativo (sobrepago)', async () => {
      const { useCase, deps } = crear({
        contributionPaymentRepository: { findById: jest.fn().mockResolvedValue({ ...cabecera, mandatoryAmount: 50 }) },
      });
      await useCase.execute(12);
      expect(deps.pdfGenerator.generateReciboPago.mock.calls[0][0].saldoPendiente).toBe(0);
    });

    it('primera cuota: nada pagado antes', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(11);
      const data = deps.pdfGenerator.generateReciboPago.mock.calls[0][0];
      expect(data).toMatchObject({ totalPagadoAntes: 0, montoPagado: 40, saldoPendiente: 110 });
    });

    it('resuelve la cuota por número de recibo cuando no es id numérico', async () => {
      const { useCase, deps } = crear();
      deps.contributionPaymentInstallmentRepository.findBy.mockResolvedValue(cuotas[0]);
      await useCase.execute(' REC-1-1 ');
      expect(deps.contributionPaymentInstallmentRepository.findBy).toHaveBeenCalledWith({ receiptNumber: 'REC-1-1' });
      expect(deps.pdfGenerator.generateReciboPago.mock.calls[0][0].numeroRecibo).toBe('REC-1-1');
    });

    it('lanza NotFoundError si la cabecera de la cuota no existe y no genera PDF', async () => {
      const { useCase, deps } = crear({ contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(null) } });
      await expect(useCase.execute(12)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
    });

    it('lanza NotFoundError si el estudiante no existe', async () => {
      const { useCase, deps } = crear({ studentRepository: { findById: jest.fn().mockResolvedValue(null) } });
      await expect(useCase.execute(12)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
    });

    it('lanza NotFoundError si la gestión no existe', async () => {
      const { useCase, deps } = crear({ managementRepository: { findById: jest.fn().mockResolvedValue(null) } });
      await expect(useCase.execute(12)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
    });

    it('no usa un id inexistente como cuota ni como cabecera si ninguno existe', async () => {
      const { useCase, deps } = crear({ contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(null) } });
      await expect(useCase.execute(999)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('recibo por cabecera', () => {
    const sinCuotaPorId = () => crear({
      contributionPaymentInstallmentRepository: {
        findById: jest.fn().mockResolvedValue(null),
        findBy: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [cuotas[0], cuotas[1]] }),
      },
    });

    it.each([['abc'], [0], [-3], [null], [undefined]])('id inválido %p lanza NotFoundError', async (id) => {
      const { useCase, deps } = sinCuotaPorId();
      await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.contributionPaymentRepository.findById).not.toHaveBeenCalled();
    });

    it('cabecera inexistente lanza NotFoundError', async () => {
      const { useCase, deps } = crear({
        contributionPaymentRepository: { findById: jest.fn().mockResolvedValue(null) },
        contributionPaymentInstallmentRepository: { findById: jest.fn().mockResolvedValue(null), findBy: jest.fn().mockResolvedValue(null), findAll: jest.fn() },
      });
      await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
    });

    it('genera y registra el documento PAGO si no existía', async () => {
      const { useCase, deps } = sinCuotaPorId();
      deps.contributionPaymentRepository.findById.mockResolvedValue({ ...cabecera, totalAmount: 200, amountPaid: 100 });
      const res = await useCase.execute(1);
      expect(res.fileName).toBe('pago_E7_000001.pdf');
      expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        studentId: 7,
        tipoDocumento: 'PAGO',
        fileName: 'pago_E7_000001.pdf',
        filePath: 'recibos/2026/pago_E7_000001.pdf',
        extension: 'pdf',
      }));
      expect(deps.studentDocumentRepository.update).not.toHaveBeenCalled();
      const data = deps.pdfGenerator.generateReciboPago.mock.calls[0][0];
      expect(data).toMatchObject({ montoTotal: 200, descuentoBeca: 50, montoPagado: 100, observacion: 'obs' });
    });

    it('reutiliza el recibo existente si el archivo físico existe (sin regenerar)', async () => {
      const { useCase, deps } = sinCuotaPorId();
      deps.studentDocumentRepository.findAll.mockResolvedValue({
        studentDocuments: [{ id: 5, fileName: 'pago_E7_000001.pdf', filePath: 'recibos/2026/pago_E7_000001.pdf' }],
      });
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const res = await useCase.execute(1);
      expect(res.filePath).toBe('/uploads/recibos/2026/pago_E7_000001.pdf');
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
      expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
    });

    it('regenera y actualiza el documento si el archivo físico no existe', async () => {
      const { useCase, deps } = sinCuotaPorId();
      deps.contributionPaymentRepository.findById.mockResolvedValue({ ...cabecera, totalAmount: 200, amountPaid: 100 });
      deps.studentDocumentRepository.findAll.mockResolvedValue({
        studentDocuments: [{ id: 5, fileName: 'pago_E7_000001.pdf', filePath: 'recibos/2026/pago_E7_000001.pdf' }],
      });
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      await useCase.execute(1);
      expect(deps.pdfGenerator.generateReciboPago).toHaveBeenCalledTimes(1);
      expect(deps.studentDocumentRepository.update).toHaveBeenCalledWith(5, expect.objectContaining({
        filePath: 'recibos/2026/pago_E7_000001.pdf',
      }));
      expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
    });

    it('estudiante inexistente lanza NotFoundError sin generar', async () => {
      const { useCase, deps } = sinCuotaPorId();
      deps.studentRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.pdfGenerator.generateReciboPago).not.toHaveBeenCalled();
    });

    it('propaga el error del generador de PDF y no guarda documento', async () => {
      const { useCase, deps } = sinCuotaPorId();
      deps.pdfGenerator.generateReciboPago.mockRejectedValue(new Error('pdf'));
      await expect(useCase.execute(1)).rejects.toThrow('pdf');
      expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
    });
  });
});
