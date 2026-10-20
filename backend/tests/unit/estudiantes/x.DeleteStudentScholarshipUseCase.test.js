import { jest } from '@jest/globals';
import { DeleteStudentScholarshipUseCase } from '../../../src/application/use-cases/estudiantes/becas/DeleteStudentScholarshipUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeleteStudentScholarshipUseCase', () => {
  const crear = ({ found = { id: 4, studentId: 5, scholarshipId: 2 }, payments = [], deleted = true } = {}) => {
    const deps = {
      studentScholarshipRepository: {
        findById: jest.fn().mockResolvedValue(found),
        delete: jest.fn().mockResolvedValue(deleted),
      },
      contributionPaymentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPayments: payments }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteStudentScholarshipUseCase(deps) };
  };

  it('elimina cuando no hay pagos vigentes vinculados', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4);
    expect(deps.contributionPaymentRepository.findAll).toHaveBeenCalledWith(
      { studentScholarshipId: 4, active: true },
      null,
      null
    );
    expect(deps.studentScholarshipRepository.delete).toHaveBeenCalledWith(4);
  });

  it('lanza NotFoundError si la beca asignada no existe', async () => {
    const { useCase, deps } = crear({ found: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.studentScholarshipRepository.delete).not.toHaveBeenCalled();
  });

  it('rechaza con ValidationError si hay pagos vigentes y menciona el recibo', async () => {
    const { useCase, deps } = crear({ payments: [{ id: 8, receiptNumber: 'R-77' }] });
    await expect(useCase.execute(4)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(4)).rejects.toThrow(/R-77/);
    expect(deps.studentScholarshipRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el repositorio no logra eliminar', async () => {
    const { useCase } = crear({ deleted: false });
    await expect(useCase.execute(4)).rejects.toThrow(NotFoundError);
  });

  it('propaga errores inesperados al consultar pagos', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(4)).rejects.toThrow('db');
    expect(deps.studentScholarshipRepository.delete).not.toHaveBeenCalled();
  });
});
