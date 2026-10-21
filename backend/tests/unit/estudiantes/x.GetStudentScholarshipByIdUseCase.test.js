import { jest } from '@jest/globals';
import { GetStudentScholarshipByIdUseCase } from '../../../src/application/use-cases/estudiantes/becas/GetStudentScholarshipByIdUseCase.js';

describe('GetStudentScholarshipByIdUseCase', () => {
  const crear = () => {
    const deps = {
      studentScholarshipRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 4, studentId: 5, scholarshipId: 2, managementId: 3, state: 'ACTIVA', requestDate: '2026-02-01',
        }),
      },
      studentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, studentCode: 'E1', firstName: 'Ana', lastName: 'Lopez', motherLastName: 'Rios', ci: '123' }),
      },
      scholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 2, name: 'Excelencia', percentage: 50 }) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 3, code: 'G26', name: 'Gestión 2026', year: 2026 }) },
      contributionPaymentRepository: { findBy: jest.fn().mockResolvedValue({ id: 90, state: 'PENDIENTE', studentId: 5, managementId: 3 }) },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new GetStudentScholarshipByIdUseCase(deps) };
  };

  it('devuelve la asignación enriquecida con estudiante, beca, gestión y pago', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(4);

    expect(deps.studentScholarshipRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.contributionPaymentRepository.findBy).toHaveBeenCalledWith({ studentScholarshipId: 4 });
    expect(res).toEqual(expect.objectContaining({ id: 4, studentId: 5, scholarshipId: 2, managementId: 3, state: 'ACTIVA' }));
    expect(res.student).toEqual(expect.objectContaining({ id: 5, codigoEstudiante: 'E1', nombreCompleto: 'Ana Lopez Rios', ci: '123' }));
    expect(res.scholarship).toEqual(expect.objectContaining({ id: 2, nombre: 'Excelencia', porcentaje: 50 }));
    expect(res.management).toEqual(expect.objectContaining({ id: 3, codigo: 'G26', anio: 2026 }));
    expect(res.payment).toEqual({ id: 90, state: 'PENDIENTE', studentId: 5, managementId: 3 });
  });

  it('conserva documentsComplete false (no lo convierte en undefined)', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findById.mockResolvedValue({
      id: 4, studentId: 5, scholarshipId: 2, managementId: 3, state: 'ACTIVA', documentsComplete: false,
    });
    const res = await useCase.execute(4);
    expect(res.documentsComplete).toBe(false);
  });

  it('devuelve null si la asignación no existe', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).resolves.toBeNull();
    expect(deps.studentRepository.findById).not.toHaveBeenCalled();
  });

  it('degrada con warn si fallan las consultas relacionadas', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockRejectedValue(new Error('a'));
    deps.scholarshipRepository.findById.mockRejectedValue(new Error('b'));
    deps.managementRepository.findById.mockRejectedValue(new Error('c'));
    deps.contributionPaymentRepository.findBy.mockRejectedValue(new Error('d'));
    const res = await useCase.execute(4);
    expect(res).toEqual(expect.objectContaining({ id: 4, student: null, scholarship: null, management: null, payment: null }));
    expect(deps.logger.warn).toHaveBeenCalledTimes(4);
  });

  it('sin pago vinculado payment es null', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findBy.mockResolvedValue(null);
    const res = await useCase.execute(4);
    expect(res.payment).toBeNull();
  });
});
