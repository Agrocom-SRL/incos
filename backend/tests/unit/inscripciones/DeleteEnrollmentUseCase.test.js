import { jest } from '@jest/globals';
import { DeleteEnrollmentUseCase } from '../../../src/application/use-cases/inscripciones/DeleteEnrollmentUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeleteEnrollmentUseCase', () => {
  const crear = () => {
    const deps = {
      enrollmentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 4, academicDataId: 20, managementId: 3 }),
        findAll: jest.fn().mockResolvedValue({ enrollments: [{ id: 4 }] }),
        delete: jest.fn().mockResolvedValue(true),
      },
      subjectEnrollmentRepository: {
        findAll: jest.fn().mockResolvedValue({ subjectEnrollments: [{ id: 1 }, { id: 2 }] }),
        delete: jest.fn().mockResolvedValue(true),
      },
      studentAcademicDataRepository: {
        findById: jest.fn().mockResolvedValue({ id: 20, studentId: 5 }),
        update: jest.fn(),
      },
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [{ id: 30 }] }),
        delete: jest.fn(),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteEnrollmentUseCase(deps) };
  };

  it('elimina materias inscritas, boletas y la inscripción', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4);

    expect(deps.subjectEnrollmentRepository.findAll)
      .toHaveBeenCalledWith({ enrollmentId: 4, active: true }, null, null);
    expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(1);
    expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(2);
    expect(deps.studentDocumentRepository.findAll).toHaveBeenCalledWith(
      { studentId: 5, tipoDocumento: 'INSCRIPCION' }, null, null
    );
    expect(deps.studentDocumentRepository.delete).toHaveBeenCalledWith(30);
    expect(deps.enrollmentRepository.delete).toHaveBeenCalledWith(4);
  });

  it('deja el estado de registro en PENDIENTE si no quedan otras inscripciones activas', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4);
    expect(deps.enrollmentRepository.findAll).toHaveBeenCalledWith(
      { academicDataId: 20, managementId: 3, active: true }, null, null
    );
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(20, { registrationState: 'PENDIENTE' });
  });

  it('mantiene el estado de registro si hay otras inscripciones activas', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findAll.mockResolvedValue({ enrollments: [{ id: 4 }, { id: 6 }] });
    await useCase.execute(4);
    expect(deps.studentAcademicDataRepository.update).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.delete).toHaveBeenCalledWith(4);
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.enrollmentRepository.delete).not.toHaveBeenCalled();
    expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si la inscripción no tiene datos académicos', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findById.mockResolvedValue({ id: 4 });
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.enrollmentRepository.delete).not.toHaveBeenCalled();
  });

  it('sin datos académicos del estudiante continúa sin borrar boletas', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findById.mockResolvedValue(null);
    await useCase.execute(4);
    expect(deps.studentDocumentRepository.findAll).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.delete).toHaveBeenCalledWith(4);
  });

  it('lanza NotFoundError si el repositorio no logra eliminar', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.delete.mockResolvedValue(false);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('si falla el borrado de materias aborta sin eliminar la inscripción (evita huérfanos)', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(4)).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
    expect(deps.enrollmentRepository.delete).not.toHaveBeenCalled();
  });
});
