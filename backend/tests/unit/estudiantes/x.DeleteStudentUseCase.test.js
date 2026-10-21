import { jest } from '@jest/globals';
import fs from 'fs';
import { DeleteStudentUseCase } from '../../../src/application/use-cases/estudiantes/DeleteStudentUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteStudentUseCase', () => {
  const repo = (extra = {}) => ({
    findAll: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true),
    ...extra,
  });

  const crear = () => {
    const deps = {
      studentRepository: repo({
        findById: jest.fn().mockResolvedValue({ id: 5, studentCode: 'E1' }),
      }),
      studentGuardianRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentGuardians: [{ id: 11 }, { id: 12 }] }),
      }),
      studentDisabilityRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentDisabilities: [{ id: 21 }] }),
      }),
      studentOriginRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentOrigins: [{ id: 31 }] }),
      }),
      studentDocumentDeliveryRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentDocumentDeliveries: [{ id: 41 }] }),
      }),
      studentDocumentRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [{ id: 51, filePath: 'documentos/estudiantes/5/a.pdf' }] }),
      }),
      studentAcademicDataRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentAcademicData: [{ id: 60 }] }),
      }),
      enrollmentRepository: repo({
        findAll: jest.fn().mockResolvedValue({ enrollments: [{ id: 70 }] }),
      }),
      subjectEnrollmentRepository: repo({
        findAll: jest.fn().mockResolvedValue({ subjectEnrollments: [{ id: 81 }, { id: 82 }] }),
      }),
      contributionPaymentRepository: repo({
        findAll: jest.fn().mockResolvedValue({ contributionPayments: [{ id: 91 }] }),
      }),
      contributionPaymentInstallmentRepository: repo({
        findAll: jest.fn().mockResolvedValue({ contributionPaymentInstallments: [{ id: 101 }, { id: 102 }] }),
      }),
      studentScholarshipRepository: repo({
        findAll: jest.fn().mockResolvedValue({ studentScholarships: [{ id: 111 }] }),
      }),
      licenseRepository: repo({
        findAll: jest.fn().mockResolvedValue({ licenses: [{ id: 121 }] }),
      }),
      transferRepository: repo({
        findAll: jest.fn().mockResolvedValue({ transfers: [{ id: 131 }] }),
      }),
      transitabilityRepository: repo({
        findAll: jest.fn().mockResolvedValue({ transitabilities: [{ id: 141 }] }),
      }),
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteStudentUseCase(deps) };
  };

  let existsSpy;
  let unlinkSpy;
  beforeEach(() => {
    existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('elimina en cascada todas las dependencias y al final el estudiante', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5);

    expect(deps.studentRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.licenseRepository.findAll).toHaveBeenCalledWith({ enrollmentIds: [70], includeInactive: true }, null, null);
    expect(deps.licenseRepository.delete).toHaveBeenCalledWith(121);
    expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(81);
    expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(82);
    expect(deps.enrollmentRepository.delete).toHaveBeenCalledWith(70);
    expect(deps.contributionPaymentInstallmentRepository.delete).toHaveBeenCalledWith(101);
    expect(deps.contributionPaymentInstallmentRepository.delete).toHaveBeenCalledWith(102);
    expect(deps.contributionPaymentRepository.delete).toHaveBeenCalledWith(91);
    expect(deps.studentScholarshipRepository.delete).toHaveBeenCalledWith(111);
    expect(deps.transferRepository.delete).toHaveBeenCalledWith(131);
    expect(deps.transitabilityRepository.delete).toHaveBeenCalledWith(141);
    expect(deps.studentDocumentRepository.delete).toHaveBeenCalledWith(51);
    expect(deps.studentDocumentDeliveryRepository.delete).toHaveBeenCalledWith(41);
    expect(deps.studentOriginRepository.delete).toHaveBeenCalledWith(31);
    expect(deps.studentDisabilityRepository.delete).toHaveBeenCalledWith(21);
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledWith(11);
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledWith(12);
    expect(deps.studentAcademicDataRepository.delete).toHaveBeenCalledWith(60);
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
  });

  it('el estudiante se elimina después de sus dependencias', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5);
    const ordenEstudiante = deps.studentRepository.delete.mock.invocationCallOrder[0];
    const ultimaDependencia = deps.studentAcademicDataRepository.delete.mock.invocationCallOrder[0];
    expect(ordenEstudiante).toBeGreaterThan(ultimaDependencia);
    expect(deps.enrollmentRepository.delete.mock.invocationCallOrder[0]).toBeGreaterThan(
      deps.subjectEnrollmentRepository.delete.mock.invocationCallOrder[1]
    );
  });

  it('con pagos ya cobrados (cuota con monto > 0): ConflictError sin eliminar nada', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentInstallmentRepository.findAll.mockResolvedValue({
      contributionPaymentInstallments: [{ id: 101, amount: 0 }, { id: 102, amount: 150 }],
    });
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ConflictError);
    for (const repoName of [
      'licenseRepository', 'subjectEnrollmentRepository', 'enrollmentRepository',
      'contributionPaymentInstallmentRepository', 'contributionPaymentRepository',
      'studentScholarshipRepository', 'studentGuardianRepository', 'studentAcademicDataRepository',
      'studentRepository',
    ]) {
      expect(deps[repoName].delete).not.toHaveBeenCalled();
    }
  });

  it('cuotas de monto 0 (compromiso de pago) no bloquean el borrado', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentInstallmentRepository.findAll.mockResolvedValue({
      contributionPaymentInstallments: [{ id: 101, amount: 0 }],
    });
    await useCase.execute(5);
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
  });

  it('estudiante inexistente: NotFoundError sin eliminar nada', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.studentRepository.delete).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.delete).not.toHaveBeenCalled();
    expect(deps.studentGuardianRepository.delete).not.toHaveBeenCalled();
  });

  it('si el repositorio no logra eliminar al estudiante lanza NotFoundError', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.delete.mockResolvedValue(false);
    await expect(useCase.execute(5)).rejects.toThrow(NotFoundError);
  });

  it('estudiante sin inscripciones: no busca ni elimina licencias', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findAll.mockResolvedValue({ enrollments: [] });
    await useCase.execute(5);
    expect(deps.licenseRepository.findAll).not.toHaveBeenCalled();
    expect(deps.enrollmentRepository.delete).not.toHaveBeenCalled();
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
  });

  it('estudiante sin ningún dato asociado se elimina igual', async () => {
    const { useCase, deps } = crear();
    for (const k of Object.keys(deps)) {
      if (k !== 'studentRepository' && k !== 'logger') deps[k].findAll.mockResolvedValue({});
    }
    await useCase.execute(5);
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
    expect(deps.studentAcademicDataRepository.delete).not.toHaveBeenCalled();
  });

  it('borra el archivo físico del documento cuando existe', async () => {
    const { useCase } = crear();
    existsSpy.mockReturnValue(true);
    await useCase.execute(5);
    expect(unlinkSpy).toHaveBeenCalledTimes(1);
    expect(unlinkSpy.mock.calls[0][0]).toMatch(/documentos\/estudiantes\/5\/a\.pdf$/);
  });

  it('si falla el borrado físico continúa y elimina el registro', async () => {
    const { useCase, deps } = crear();
    existsSpy.mockReturnValue(true);
    unlinkSpy.mockImplementation(() => {
      throw new Error('EACCES');
    });
    await useCase.execute(5);
    expect(deps.studentDocumentRepository.delete).toHaveBeenCalledWith(51);
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('un error al borrar datos académicos individuales no impide eliminar al estudiante', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.delete.mockRejectedValue(new Error('fk'));
    await useCase.execute(5);
    expect(deps.studentRepository.delete).toHaveBeenCalledWith(5);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('un error en una dependencia aborta antes de eliminar al estudiante', async () => {
    const { useCase, deps } = crear();
    deps.studentGuardianRepository.delete.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(5)).rejects.toThrow('db');
    expect(deps.studentRepository.delete).not.toHaveBeenCalled();
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
