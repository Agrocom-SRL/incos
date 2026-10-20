import { jest } from '@jest/globals';
import { CreateEnrollmentUseCase } from '../../../src/application/use-cases/inscripciones/CreateEnrollmentUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateEnrollmentUseCase', () => {
  const gestion = { id: 3, year: 2026 };

  const crear = () => {
    const deps = {
      enrollmentRepository: {
        findAll: jest.fn().mockResolvedValue({ enrollments: [] }),
        create: jest.fn(async (d) => ({ id: 70, ...d })),
      },
      subjectEnrollmentRepository: {
        existeCursandoEnGestion: jest.fn().mockResolvedValue(false),
        create: jest.fn(async (d) => ({ id: 800 + d.offerCourseId, ...d })),
      },
      studentRepository: { findById: jest.fn().mockResolvedValue({ id: 5, studentCode: '20260001' }) },
      parallelRepository: { findById: jest.fn().mockResolvedValue({ id: 9, name: 'A' }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue(gestion) },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      contributionPaymentRepository: {
        findAll: jest.fn().mockResolvedValue({ contributionPayments: [{ id: 1, state: 'PARCIAL' }] }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    const useCase = new CreateEnrollmentUseCase(deps);
    // Las resoluciones de plan/oferta tienen su propia cobertura de reglas de negocio;
    // aquí se fijan para probar la orquestación y las validaciones de entrada.
    jest.spyOn(useCase, '_getOrCreateStudentAcademicData').mockResolvedValue({ id: 20 });
    jest.spyOn(useCase, '_getStudyPlanAndManagementPlan')
      .mockResolvedValue({ studyPlan: { id: 1 }, managementPlan: { id: 2 } });
    jest.spyOn(useCase, '_asegurarCarreraDatosAcademicos').mockResolvedValue();
    jest.spyOn(useCase, '_getCourseOfferRowsFromParallel').mockResolvedValue([
      { offerCourseId: 101, curriculumSubjectId: 11 },
      { offerCourseId: 102, curriculumSubjectId: 12 },
    ]);
    jest.spyOn(useCase, '_createPriorEnrollmentHistory').mockResolvedValue([]);
    return { deps, useCase };
  };

  it('crea la inscripción y una matrícula INSCRITO por oferta del paralelo', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ studentId: 5, parallelId: 9, observations: 'obs' });

    expect(deps.enrollmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      academicDataId: 20, managementId: 3, enrollmentType: 'NUEVO', observations: 'obs',
    }));
    expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledTimes(2);
    expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith({
      enrollmentId: 70, offerCourseId: 101, curriculumSubjectId: 11, status: 'INSCRITO', observations: null,
    });
    expect(result.enrollment.id).toBe(70);
    expect(result.subjectEnrollments).toHaveLength(2);
    expect(result.priorEnrollmentHistories).toEqual([]);
  });

  it('exige el ID del estudiante', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ parallelId: 9 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el estudiante no existe', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 99, parallelId: 9 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('exige parallelId cuando no se envían materias', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ studentId: 5 })).rejects.toThrow('El ID del paralelo es requerido');
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el paralelo no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 5, parallelId: 404 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('falla si no hay configuración de gestión actual', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 5, parallelId: 9 }))
      .rejects.toThrow('No se encontró la configuración de gestión actual');
  });

  it('falla si la gestión actual configurada no es un año', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    await expect(useCase.execute({ studentId: 5, parallelId: 9 })).rejects.toThrow('no es un año válido');
  });

  it('falla si no hay gestión vigente para el año', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 5, parallelId: 9 })).rejects.toThrow('gestión vigente');
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });
  });

  it('rechaza una segunda inscripción en la misma gestión', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findAll.mockResolvedValue({ enrollments: [{ id: 1 }] });
    await expect(useCase.execute({ studentId: 5, parallelId: 9 }))
      .rejects.toThrow('Ya existe una inscripción para este estudiante en la gestión 2026');
    expect(deps.enrollmentRepository.findAll).toHaveBeenCalledWith(
      { academicDataId: 20, managementId: 3, active: true }, 1, null
    );
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si el estudiante no tiene pago de aporte', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findAll.mockResolvedValue({ contributionPayments: [] });
    await expect(useCase.execute({ studentId: 5, parallelId: 9 }))
      .rejects.toThrow('no ha realizado el pago del aporte');
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si el aporte está PENDIENTE y acepta CANCELADO', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findAll.mockResolvedValue({
      contributionPayments: [{ id: 1, state: 'PENDIENTE' }],
    });
    await expect(useCase.execute({ studentId: 5, parallelId: 9 })).rejects.toThrow('pendiente de pago');

    deps.contributionPaymentRepository.findAll.mockResolvedValue({
      contributionPayments: [{ id: 1, state: 'cancelado' }],
    });
    await expect(useCase.execute({ studentId: 5, parallelId: 9 })).resolves.toBeDefined();
  });

  it('modo materias: exige poder determinar el paralelo desde las asignaciones', async () => {
    const { useCase, deps } = crear();
    jest.spyOn(useCase, '_getParallelFromFirstTeacherAssignment').mockResolvedValue({ parallel: null });
    await expect(useCase.execute({ studentId: 5, teacherAssignmentIds: [1] }))
      .rejects.toThrow('No se pudo determinar la carrera');
    expect(deps.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  it('modo materias: usa las ofertas de las asignaciones docentes', async () => {
    const { useCase, deps } = crear();
    jest.spyOn(useCase, '_getParallelFromFirstTeacherAssignment').mockResolvedValue({ parallel: { id: 9 } });
    jest.spyOn(useCase, '_validateAndResolveTeacherAssignments').mockResolvedValue([{ id: 1 }]);
    jest.spyOn(useCase, '_offerRowsFromTeacherAssignments')
      .mockResolvedValue([{ offerCourseId: 555, curriculumSubjectId: null }]);
    const result = await useCase.execute({ studentId: 5, teacherAssignmentIds: [1], enrollmentType: 'ANTIGUO' });
    expect(deps.enrollmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ enrollmentType: 'ANTIGUO' })
    );
    expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ offerCourseId: 555, curriculumSubjectId: null })
    );
    expect(result.subjectEnrollments).toHaveLength(1);
  });

  it('registra el error y lo propaga si falla la creación', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.create.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({ studentId: 5, parallelId: 9 })).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
