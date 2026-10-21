import { jest } from '@jest/globals';
import { GetStudentScholarshipsByStudentIdUseCase } from '../../../src/application/use-cases/estudiantes/becas/GetStudentScholarshipsByStudentIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetStudentScholarshipsByStudentIdUseCase', () => {
  const crear = (student = { id: 5, studentCode: 'E1' }) => {
    const deps = {
      studentRepository: { findById: jest.fn().mockResolvedValue(student) },
      studentScholarshipRepository: {
        findAll: jest.fn().mockResolvedValue({
          studentScholarships: [
            { id: 1, studentId: 5, scholarshipId: 2, managementId: 3 },
            { id: 2, studentId: 5, scholarshipId: 2, managementId: 3 },
          ],
        }),
      },
      scholarshipRepository: { findById: jest.fn().mockResolvedValue({ id: 2, name: 'Excelencia', code: 'EXC', percentage: 50 }) },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 3, code: 'G26', name: 'Gestión 2026', year: 2026 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetStudentScholarshipsByStudentIdUseCase(deps) };
  };

  it('devuelve becas enriquecidas y catálogos sin repetir consultas', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(5);

    expect(deps.studentScholarshipRepository.findAll).toHaveBeenCalledWith({ studentId: 5 }, null, null);
    expect(deps.scholarshipRepository.findById).toHaveBeenCalledTimes(1);
    expect(deps.managementRepository.findById).toHaveBeenCalledTimes(1);
    expect(res.scholarships).toHaveLength(2);
    expect(res.scholarships[0]).toEqual(
      expect.objectContaining({
        scholarshipName: 'Excelencia',
        scholarshipCode: 'EXC',
        scholarshipPercentage: 50,
        managementCode: 'G26',
        managementName: 'Gestión 2026',
        managementYear: 2026,
      })
    );
    expect(Object.keys(res.catalogs.scholarships)).toEqual(['2']);
    expect(Object.keys(res.catalogs.managements)).toEqual(['3']);
  });

  it('lanza NotFoundError si el estudiante no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.studentScholarshipRepository.findAll).not.toHaveBeenCalled();
  });

  it('estudiante sin becas devuelve listas vacías', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findAll.mockResolvedValue({});
    const res = await useCase.execute(5);
    expect(res).toEqual({ scholarships: [], catalogs: { scholarships: {}, managements: {} } });
  });

  it('conserva el 0% y el año de gestión 0 (no los convierte en null)', async () => {
    const { useCase, deps } = crear();
    deps.scholarshipRepository.findById.mockResolvedValue({ id: 2, name: 'Sin descuento', code: 'SD', percentage: 0 });
    deps.managementRepository.findById.mockResolvedValue({ id: 3, code: 'G0', name: 'Gestión 0', year: 0 });
    const res = await useCase.execute(5);
    expect(res.scholarships[0]).toEqual(expect.objectContaining({ scholarshipPercentage: 0, managementYear: 0 }));
  });

  it('si falla un catálogo avisa y deja campos en null', async () => {
    const { useCase, deps } = crear();
    deps.scholarshipRepository.findById.mockRejectedValue(new Error('x'));
    deps.managementRepository.findById.mockRejectedValue(new Error('y'));
    const res = await useCase.execute(5);
    expect(res.scholarships[0]).toEqual(expect.objectContaining({ scholarshipName: null, managementCode: null }));
    expect(deps.logger.warn).toHaveBeenCalledTimes(2);
  });
});
