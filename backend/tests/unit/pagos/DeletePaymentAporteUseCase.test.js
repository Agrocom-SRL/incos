import { jest } from '@jest/globals';
import { DeletePaymentAporteUseCase } from '../../../src/application/use-cases/pagos/DeletePaymentAporteUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeletePaymentAporteUseCase', () => {
  const crear = () => {
    const deps = {
      contributionPaymentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 1, studentId: 7, paymentDate: '2026-03-10', concept: 'Aporte' }),
        delete: jest.fn().mockResolvedValue(true),
      },
      contributionPaymentInstallmentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [{ id: 11 }, { id: 12 }] }),
        delete: jest.fn(),
      },
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }),
        delete: jest.fn(),
      },
      studentDocumentDeliveryRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocumentDeliveries: [] }),
        delete: jest.fn(),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeletePaymentAporteUseCase(deps) };
  };

  it('elimina las cuotas y luego el pago', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(1);
    expect(deps.contributionPaymentInstallmentRepository.findAll)
      .toHaveBeenCalledWith({ contributionPaymentId: 1 }, null, null);
    expect(deps.contributionPaymentInstallmentRepository.delete).toHaveBeenCalledWith(11);
    expect(deps.contributionPaymentInstallmentRepository.delete).toHaveBeenCalledWith(12);
    expect(deps.contributionPaymentRepository.delete).toHaveBeenCalledWith(1);
  });

  it('lanza NotFoundError si el pago no existe', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.contributionPaymentRepository.delete).not.toHaveBeenCalled();
  });

  it('no permite eliminar un pago vinculado a una inscripción', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findById.mockResolvedValue({ id: 1, studentId: 7, enrollmentId: 4 });
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.contributionPaymentInstallmentRepository.delete).not.toHaveBeenCalled();
    expect(deps.contributionPaymentRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el repositorio no logra eliminar', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.delete.mockResolvedValue(false);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('si falla el borrado de cuotas aborta sin eliminar el pago', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentInstallmentRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(1)).rejects.toThrow('db');
    expect(deps.contributionPaymentRepository.delete).not.toHaveBeenCalled();
  });

  describe('documentos de pago', () => {
    const conRecibo = (documentos) => {
      const ctx = crear();
      ctx.deps.contributionPaymentRepository.findById.mockResolvedValue({
        id: 1, studentId: 7, paymentDate: '2026-03-10', concept: 'Aporte', receiptNumber: '55',
      });
      ctx.deps.studentDocumentRepository.findAll.mockResolvedValue({ studentDocuments: documentos });
      return ctx;
    };

    it('busca los documentos PAGO del estudiante y elimina las entregas del concepto', async () => {
      const { useCase, deps } = conRecibo([
        { id: 30, fileName: 'RECIBO_PAGO_123_55_1700000000.pdf', createdAt: '2020-01-01' },
      ]);
      deps.studentDocumentDeliveryRepository.findAll.mockResolvedValue({
        studentDocumentDeliveries: [
          { id: 40, observaciones: 'Comprobante de pago aporte', fechaEntrega: '2026-03-10' },
          { id: 41, observaciones: 'Otra cosa', fechaEntrega: '2026-03-10' },
        ],
      });
      await useCase.execute(1);
      expect(deps.studentDocumentRepository.findAll)
        .toHaveBeenCalledWith({ studentId: 7, tipoDocumento: 'PAGO' }, null, null);
      expect(deps.studentDocumentDeliveryRepository.delete).toHaveBeenCalledTimes(1);
      expect(deps.studentDocumentDeliveryRepository.delete).toHaveBeenCalledWith(40);
    });

    it('elimina el recibo de ESTE pago (por número) y no el de otro pago del estudiante', async () => {
      const { useCase, deps } = conRecibo([
        { id: 30, fileName: 'RECIBO_PAGO_123_55_1700000000.pdf', createdAt: '2020-01-01' },
        { id: 31, fileName: 'RECIBO_PAGO_123_99_1700000001.pdf', createdAt: '2020-01-01' },
      ]);
      await useCase.execute(1);
      expect(deps.studentDocumentRepository.delete).toHaveBeenCalledWith(30);
      expect(deps.studentDocumentRepository.delete).not.toHaveBeenCalledWith(31);
    });

    it('un documento de respaldo se elimina solo si se creó el mismo día del pago', async () => {
      const { useCase, deps } = conRecibo([
        { id: 32, fileName: 'comprobante.jpg', createdAt: '2026-03-10T15:00:00' },
        { id: 33, fileName: 'otro-comprobante.jpg', createdAt: '2026-01-02T10:00:00' },
      ]);
      await useCase.execute(1);
      expect(deps.studentDocumentRepository.delete).toHaveBeenCalledWith(32);
      expect(deps.studentDocumentRepository.delete).not.toHaveBeenCalledWith(33);
    });

    it('un documento sin fecha NO se elimina (antes se borraban todos los PAGO del estudiante)', async () => {
      const { useCase, deps } = conRecibo([{ id: 34, fileName: 'pagos/sin-fecha.pdf' }]);
      await useCase.execute(1);
      expect(deps.studentDocumentRepository.delete).not.toHaveBeenCalled();
    });

    it('un nombre que solo contiene "pagos" no basta para eliminar el documento', async () => {
      const { useCase, deps } = conRecibo([
        { id: 35, fileName: 'documentos/estudiantes/7/pagos/viejo.pdf', createdAt: '2019-05-05' },
      ]);
      await useCase.execute(1);
      expect(deps.studentDocumentRepository.delete).not.toHaveBeenCalled();
    });
  });

  it('un fallo al borrar documentos no impide eliminar el pago', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.findAll.mockRejectedValue(new Error('db'));
    await useCase.execute(1);
    expect(deps.logger.error).toHaveBeenCalled();
    expect(deps.contributionPaymentRepository.delete).toHaveBeenCalledWith(1);
  });
});
