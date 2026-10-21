import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockResolverPlan = jest.fn();
const mockCargarEstructura = jest.fn();
const mockValidarReglas = jest.fn();
const mockDerivarCarrera = jest.fn();
jest.unstable_mockModule('../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js', () => ({
  resolverPlanEstudioInscripcion: mockResolverPlan,
  cargarEstructuraPlan: mockCargarEstructura,
  validarReglasInscripcion: mockValidarReglas,
  derivarCarreraPlanDesdeMatriculas: mockDerivarCarrera,
}));

const { UpdateEnrollmentUseCase } = await import(
  '../../../src/application/use-cases/inscripciones/UpdateEnrollmentUseCase.js'
);
const { NotFoundError, ValidationError } = await import('../../../src/domain/errors/AppError.js');

describe('UpdateEnrollmentUseCase', () => {
  const enrollment = { id: 4, academicDataId: 20, managementId: 3, enrollmentType: 'ANTIGUO' };

  const crear = () => {
    const deps = {
      enrollmentRepository: {
        findById: jest.fn().mockResolvedValue(enrollment),
        update: jest.fn().mockResolvedValue(true),
        count: jest.fn().mockResolvedValue(1),
      },
      subjectEnrollmentRepository: {
        findAll: jest.fn().mockResolvedValue({ subjectEnrollments: [{ id: 1 }, { id: 2 }] }),
        delete: jest.fn().mockResolvedValue(true),
        create: jest.fn().mockResolvedValue({}),
      },
      studentAcademicDataRepository: {
        findById: jest.fn().mockResolvedValue({ id: 20, studentId: 5, careerId: 8 }),
        findAll: jest.fn().mockResolvedValue({ studentAcademicData: [{ id: 20 }] }),
        update: jest.fn(),
      },
      parallelRepository: { findById: jest.fn().mockResolvedValue({ id: 9, name: 'A' }) },
      courseOfferRepository: {
        findEnrichedByParallelManagementId: jest.fn().mockResolvedValue([
          { id: 100, asignaturaPlanId: 11, activo: true },
          { id: 101, asignaturaPlanId: 12, activo: 0 },
        ]),
        findById: jest.fn(),
      },
      parallelManagementRepository: {
        findByParallelAndManagementPlan: jest.fn().mockResolvedValue({ id: 50 }),
      },
      teacherAssignmentRepository: { findById: jest.fn(), findAll: jest.fn() },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
      managementPlanRepository: {},
      studyPlanRepository: {},
      planSubjectRepository: { findAll: jest.fn() },
      priorEnrollmentHistoryRepository: {
        findAll: jest.fn().mockResolvedValue({ priorEnrollmentHistories: [{ id: 70 }] }),
        create: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue(true),
      },
      periodRepository: undefined,
      subjectRepository: undefined,
      prerequisiteRepository: undefined,
      transferRepository: undefined,
      historialAcademicoRepository: undefined,
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateEnrollmentUseCase(deps) };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolverPlan.mockResolvedValue({ studyPlan: { id: 6 }, managementPlan: { id: 7, studyPlanId: 6 } });
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99, { observations: 'x' })).rejects.toThrow(NotFoundError);
    expect(deps.enrollmentRepository.update).not.toHaveBeenCalled();
  });

  it('actualiza observaciones y fecha y devuelve la inscripción mapeada', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findById.mockResolvedValue({ ...enrollment, observations: 'nueva' });
    const res = await useCase.execute(4, { observations: 'nueva', enrollmentDate: '2026-02-01' });

    expect(deps.enrollmentRepository.update).toHaveBeenCalledWith(4, {
      observations: 'nueva',
      enrollmentDate: '2026-02-01',
    });
    expect(res).toEqual(expect.objectContaining({ observaciones: 'nueva' }));
    expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
  });

  it('permite limpiar observaciones con null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4, { observations: null });
    expect(deps.enrollmentRepository.update).toHaveBeenCalledWith(4, { observations: null });
  });

  it('payload vacío no actualiza nada', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4);
    expect(deps.enrollmentRepository.update).not.toHaveBeenCalled();
  });

  it('repara la carrera de los datos académicos cuando falta', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findById.mockResolvedValue({ id: 20, studentId: 5, careerId: null });
    mockDerivarCarrera.mockResolvedValue({ careerId: 8, studyPlanId: 6 });
    await useCase.execute(4, { observations: 'x' });
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(20, { careerId: 8 });
  });

  it('no repara la carrera si no se puede derivar', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findById.mockResolvedValue({ id: 20, studentId: 5, careerId: null });
    mockDerivarCarrera.mockResolvedValue(null);
    await useCase.execute(4, { observations: 'x' });
    expect(deps.studentAcademicDataRepository.update).not.toHaveBeenCalled();
  });

  describe('reemplazo de materias por paralelo', () => {
    it('elimina las materias previas y crea INSCRITO solo para ofertas activas', async () => {
      const { useCase, deps } = crear();
      deps.subjectEnrollmentRepository.findAll
        .mockResolvedValueOnce({ subjectEnrollments: [{ id: 1 }, { id: 2 }] })
        .mockResolvedValueOnce({ subjectEnrollments: [{ id: 300, offerCourseId: 100 }] });

      const res = await useCase.execute(4, { parallelId: 9 });

      expect(deps.parallelManagementRepository.findByParallelAndManagementPlan).toHaveBeenCalledWith(9, 7);
      expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).toHaveBeenCalledWith(50);
      expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(1);
      expect(deps.subjectEnrollmentRepository.delete).toHaveBeenCalledWith(2);
      expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledTimes(1);
      expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith({
        enrollmentId: 4,
        offerCourseId: 100,
        curriculumSubjectId: 11,
        status: 'INSCRITO',
        observations: null,
      });
      expect(res.subjectEnrollments).toHaveLength(1);
    });

    it('paralelo inexistente: NotFoundError y no borra materias', async () => {
      const { useCase, deps } = crear();
      deps.parallelRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(4, { parallelId: 99 })).rejects.toThrow(NotFoundError);
      expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
    });

    it('paralelo no instanciado en la gestión: ValidationError y no borra materias', async () => {
      const { useCase, deps } = crear();
      deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(null);
      await expect(useCase.execute(4, { parallelId: 9 })).rejects.toThrow(ValidationError);
      expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
    });

    it('paralelo sin ofertas activas: ValidationError', async () => {
      const { useCase, deps } = crear();
      deps.courseOfferRepository.findEnrichedByParallelManagementId.mockResolvedValue([{ id: 1, activo: false }]);
      await expect(useCase.execute(4, { parallelId: 9 })).rejects.toThrow(ValidationError);
      expect(deps.subjectEnrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('inscripción sin datos académicos o gestión: ValidationError', async () => {
      const { useCase, deps } = crear();
      deps.enrollmentRepository.findById.mockResolvedValue({ id: 4 });
      await expect(useCase.execute(4, { parallelId: 9 })).rejects.toThrow(ValidationError);
    });

    it('datos académicos o gestión inexistentes: NotFoundError', async () => {
      const { useCase, deps } = crear();
      deps.managementRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(4, { parallelId: 9 })).rejects.toThrow(NotFoundError);
    });

    it('si las reglas de negocio fallan no se eliminan las materias existentes', async () => {
      const { deps } = crear();
      deps.periodRepository = {};
      deps.subjectRepository = {};
      deps.prerequisiteRepository = {};
      const uc = new UpdateEnrollmentUseCase(deps);
      mockCargarEstructura.mockResolvedValue({});
      mockValidarReglas.mockImplementation(() => {
        throw new ValidationError('prerrequisito');
      });
      await expect(uc.execute(4, { parallelId: 9 })).rejects.toThrow('prerrequisito');
      expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
      expect(deps.subjectEnrollmentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('reemplazo de materias por asignaciones docentes', () => {
    it('rechaza una asignación inexistente', async () => {
      const { useCase, deps } = crear();
      deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(4, { teacherAssignmentIds: [5] })).rejects.toThrow(NotFoundError);
    });

    it('rechaza una asignación de otro plan de gestión', async () => {
      const { useCase, deps } = crear();
      deps.teacherAssignmentRepository.findById.mockResolvedValue({ id: 5, managementPlanId: 999, offerCourseId: 100 });
      await expect(useCase.execute(4, { teacherAssignmentIds: [5] })).rejects.toThrow(ValidationError);
      expect(deps.subjectEnrollmentRepository.delete).not.toHaveBeenCalled();
    });

    it('crea una materia por oferta, sin duplicar ofertas', async () => {
      const { useCase, deps } = crear();
      deps.teacherAssignmentRepository.findById
        .mockResolvedValueOnce({ id: 5, managementPlanId: 7, offerCourseId: 100 })
        .mockResolvedValueOnce({ id: 6, managementPlanId: 7, offerCourseId: 100 });
      deps.courseOfferRepository.findById.mockResolvedValue({ id: 100, planSubjectId: 11 });

      await useCase.execute(4, { teacherAssignmentIds: [5, 6] });

      expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledTimes(1);
      expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ enrollmentId: 4, offerCourseId: 100, curriculumSubjectId: 11, status: 'INSCRITO' })
      );
    });

    it('asignación sin oferta de curso: ValidationError', async () => {
      const { useCase, deps } = crear();
      deps.teacherAssignmentRepository.findById.mockResolvedValue({ id: 5, managementPlanId: 7 });
      await expect(useCase.execute(4, { teacherAssignmentIds: [5] })).rejects.toThrow(ValidationError);
    });
  });

  describe('historial previo', () => {
    it('reemplaza el historial: borra el anterior y crea filas válidas', async () => {
      const { useCase, deps } = crear();
      deps.planSubjectRepository.findAll.mockResolvedValue({ planSubjects: [{ id: 33 }] });
      await useCase.execute(4, { priorHistory: [{ materiaId: 2, periodId: 1, status: 'APROBADO', finalGrade: 70 }] });

      expect(deps.priorEnrollmentHistoryRepository.delete).toHaveBeenCalledWith(70);
      expect(deps.planSubjectRepository.findAll).toHaveBeenCalledWith(
        { studyPlanId: 6, periodId: 1, subjectId: 2 },
        null,
        null
      );
      expect(deps.priorEnrollmentHistoryRepository.create).toHaveBeenCalledWith({
        enrollmentId: 4,
        curriculumSubjectId: 33,
        finalGrade: 70,
        status: 'APROBADO',
      });
    });

    it('arreglo vacío solo vacía el historial', async () => {
      const { useCase, deps } = crear();
      await useCase.execute(4, { priorHistory: [] });
      expect(deps.priorEnrollmentHistoryRepository.delete).toHaveBeenCalledWith(70);
      expect(deps.priorEnrollmentHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('nota NaN en una fila aprobada lanza ValidationError sin borrar el historial', async () => {
      const { useCase, deps } = crear();
      await expect(
        useCase.execute(4, { priorHistory: [{ materiaId: 2, periodId: 1, status: 'APROBADO', finalGrade: 'abc' }] })
      ).rejects.toThrow(ValidationError);
      expect(deps.priorEnrollmentHistoryRepository.delete).not.toHaveBeenCalled();
      expect(deps.priorEnrollmentHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('una fila inválida entre varias válidas no borra el historial existente', async () => {
      const { useCase, deps } = crear();
      deps.planSubjectRepository.findAll
        .mockResolvedValueOnce({ planSubjects: [{ id: 33 }] })
        .mockResolvedValueOnce({ planSubjects: [] });
      await expect(
        useCase.execute(4, {
          priorHistory: [
            { materiaId: 2, periodId: 1, status: 'APROBADO', finalGrade: 70 },
            { materiaId: 3, periodId: 1, status: 'APROBADO', finalGrade: 80 },
          ],
        })
      ).rejects.toThrow(ValidationError);
      expect(deps.priorEnrollmentHistoryRepository.delete).not.toHaveBeenCalled();
      expect(deps.priorEnrollmentHistoryRepository.create).not.toHaveBeenCalled();
    });

    it('datos académicos huérfanos: NotFoundError (no TypeError)', async () => {
      const { useCase, deps } = crear();
      deps.studentAcademicDataRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(4, { priorHistory: [] })).rejects.toThrow(NotFoundError);
      expect(deps.priorEnrollmentHistoryRepository.delete).not.toHaveBeenCalled();
    });

    it('materia sin asignatura de plan en el periodo: ValidationError', async () => {
      const { useCase, deps } = crear();
      deps.planSubjectRepository.findAll.mockResolvedValue({ planSubjects: [] });
      await expect(
        useCase.execute(4, { priorHistory: [{ materiaId: 2, periodId: 1, status: 'APROBADO', finalGrade: 70 }] })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('executePriorHistoryOnly', () => {
    it('rechaza si priorHistory no es arreglo', async () => {
      const { useCase, deps } = crear();
      await expect(useCase.executePriorHistoryOnly(4, 'x')).rejects.toThrow(ValidationError);
      expect(deps.enrollmentRepository.findById).not.toHaveBeenCalled();
    });

    it('lanza NotFoundError si la inscripción no existe', async () => {
      const { useCase, deps } = crear();
      deps.enrollmentRepository.findById.mockResolvedValue(null);
      await expect(useCase.executePriorHistoryOnly(99, [])).rejects.toThrow(NotFoundError);
    });

    it('datos académicos huérfanos: NotFoundError sin tocar el historial', async () => {
      const { useCase, deps } = crear();
      deps.studentAcademicDataRepository.findById.mockResolvedValue(null);
      await expect(useCase.executePriorHistoryOnly(4, [])).rejects.toThrow(NotFoundError);
      expect(deps.priorEnrollmentHistoryRepository.delete).not.toHaveBeenCalled();
    });

    it('vacía el historial y devuelve la inscripción mapeada', async () => {
      const { useCase, deps } = crear();
      const res = await useCase.executePriorHistoryOnly(4, []);
      expect(deps.priorEnrollmentHistoryRepository.delete).toHaveBeenCalledWith(70);
      expect(res).toEqual(expect.objectContaining({ id: 4 }));
    });
  });
});
