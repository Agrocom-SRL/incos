import { describe, it, expect, jest } from '@jest/globals';

const mockActivar = jest.fn().mockResolvedValue({});
jest.unstable_mockModule('../../../src/application/utils/activarCursadoInscripcion.js', () => ({
  activarCursadoInscripcion: mockActivar,
}));

const { CreateEnrollmentUseCase } = await import(
  '../../../src/application/use-cases/inscripciones/CreateEnrollmentUseCase.js'
);
const { NotFoundError, ValidationError } = await import('../../../src/domain/errors/AppError.js');

const plano = (o) => ({ ...o, toPlainObject: () => o });

const crear = (over = {}) => {
  const deps = {
    enrollmentRepository: {
      findAll: jest.fn().mockResolvedValue({ enrollments: [] }),
      create: jest.fn(async (d) => ({ id: 70, ...d })),
      count: jest.fn().mockResolvedValue(0),
    },
    subjectEnrollmentRepository: {
      existeCursandoEnGestion: jest.fn().mockResolvedValue(false),
      create: jest.fn(async (d) => ({ id: 800 + d.offerCourseId, ...d })),
    },
    studentRepository: { findById: jest.fn().mockResolvedValue({ id: 5 }) },
    studentAcademicDataRepository: {
      findAll: jest.fn().mockResolvedValue({ studentAcademicData: [] }),
      create: jest.fn(async (d) => ({ id: 20, ...d })),
      update: jest.fn().mockResolvedValue(true),
      findById: jest.fn().mockResolvedValue({ id: 20, careerId: 8 }),
    },
    parallelRepository: { findById: jest.fn().mockResolvedValue({ id: 9, name: 'A', careerId: 8 }) },
    courseOfferRepository: { findById: jest.fn(), findEnrichedByParallelManagementId: jest.fn() },
    parallelManagementRepository: {
      findById: jest.fn(),
      findByParallelAndManagementPlan: jest.fn(),
    },
    teacherAssignmentRepository: { findById: jest.fn(), findAll: jest.fn() },
    managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
    configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
    contributionPaymentRepository: {
      findAll: jest.fn().mockResolvedValue({ contributionPayments: [{ id: 1, state: 'PARCIAL' }] }),
    },
    studyPlanRepository: { findById: jest.fn(), findAll: jest.fn() },
    managementPlanRepository: { findAll: jest.fn() },
    transferRepository: { findAll: jest.fn() },
    planSubjectRepository: { findAll: jest.fn() },
    priorEnrollmentHistoryRepository: { create: jest.fn(async (d) => ({ id: 1, ...d })) },
    subjectEnrollmentBimesterRepository: {},
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    ...over,
  };
  return { deps, useCase: new CreateEnrollmentUseCase(deps) };
};

describe('CreateEnrollmentUseCase · datos académicos', () => {
  const student = { id: 5 };
  const management = { id: 3 };

  it('crea datos académicos ADMITIDO con la carrera del paralelo si no existen', async () => {
    const { useCase, deps } = crear();
    const r = await useCase._getOrCreateStudentAcademicData(student, { careerId: 8 }, management);
    expect(deps.studentAcademicDataRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 5, careerId: 8, managementIngressId: 3, registrationState: 'ADMITIDO' })
    );
    expect(r.id).toBe(20);
  });

  it('actualiza carrera y estado de registro del dato existente', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({
      studentAcademicData: [{ id: 20, active: true, careerId: 1, registrationState: 'BORRADOR' }],
    });
    await useCase._getOrCreateStudentAcademicData(student, plano({ careerId: 8 }), management);
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(20, {
      careerId: 8,
      managementIngressId: 3,
      registrationState: 'ADMITIDO',
    });
  });

  it('si ya está ADMITIDO con la misma carrera no actualiza', async () => {
    const { useCase, deps } = crear();
    const existente = { id: 20, active: true, careerId: 8, registrationState: 'ADMITIDO' };
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({ studentAcademicData: [existente] });
    const r = await useCase._getOrCreateStudentAcademicData(student, { careerId: 8 }, management);
    expect(r).toBe(existente);
    expect(deps.studentAcademicDataRepository.update).not.toHaveBeenCalled();
  });

  it('fija la carrera del plan cuando los datos académicos no la tienen', async () => {
    const { useCase, deps } = crear();
    await useCase._asegurarCarreraDatosAcademicos({ id: 20, careerId: null }, plano({ id: 1, careerId: 8 }));
    expect(deps.studentAcademicDataRepository.update).toHaveBeenCalledWith(20, { careerId: 8 });
    deps.studentAcademicDataRepository.update.mockClear();
    await useCase._asegurarCarreraDatosAcademicos({ id: 20, careerId: 3 }, { careerId: 8 });
    await useCase._asegurarCarreraDatosAcademicos({ id: 20 }, {});
    expect(deps.studentAcademicDataRepository.update).not.toHaveBeenCalled();
  });
});

describe('CreateEnrollmentUseCase · soporte', () => {
  it('_getHistorialFilas devuelve [] sin repositorio y delega con él', async () => {
    const { useCase } = crear();
    expect(await useCase._getHistorialFilas(5)).toEqual([]);
    const historialAcademicoRepository = { listarFilasHistorialPorEstudiante: jest.fn().mockResolvedValue([{ a: 1 }]) };
    const { useCase: conRepo } = crear({ historialAcademicoRepository });
    expect(await conRepo._getHistorialFilas(5)).toEqual([{ a: 1 }]);
    expect(historialAcademicoRepository.listarFilasHistorialPorEstudiante).toHaveBeenCalledWith(5);
  });

  it('_contarInscripcionesActivas suma las inscripciones de todos los datos académicos', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({ studentAcademicData: [{ id: 1 }, { id: 2 }] });
    deps.enrollmentRepository.count.mockResolvedValueOnce(2).mockResolvedValueOnce('x');
    expect(await useCase._contarInscripcionesActivas(5)).toBe(2);
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({});
    expect(await useCase._contarInscripcionesActivas(5)).toBe(0);
  });

  it('_getTraspasoAnioCursado toma el último traspaso o null', async () => {
    const { useCase, deps } = crear();
    deps.transferRepository.findAll.mockResolvedValue({
      transfers: [{ anioCursado: 'PRIMERO' }, plano({ anio_cursado: 'SEGUNDO' })],
    });
    expect(await useCase._getTraspasoAnioCursado(5)).toBe('SEGUNDO');
    deps.transferRepository.findAll.mockResolvedValue({});
    expect(await useCase._getTraspasoAnioCursado(5)).toBeNull();
    const { useCase: sinRepo } = crear({ transferRepository: null });
    expect(await sinRepo._getTraspasoAnioCursado(5)).toBeNull();
  });

  it('_validarReglasNegocio se omite sin repos de plan o sin materias de plan', async () => {
    const { useCase, deps } = crear();
    await useCase._validarReglasNegocio({ student: { id: 5 }, studyPlan: { id: 1 }, offerRows: [{ curriculumSubjectId: 1 }] });
    expect(deps.logger.warn).toHaveBeenCalled();

    const { useCase: completo } = crear({
      periodRepository: { findAll: jest.fn() },
      prerequisiteRepository: { findAll: jest.fn() },
      subjectRepository: { findAll: jest.fn() },
    });
    await completo._validarReglasNegocio({
      student: { id: 5 },
      studyPlan: { id: 1 },
      offerRows: [{ offerCourseId: 1, curriculumSubjectId: null }],
    });
    expect(completo.periodRepository.findAll).not.toHaveBeenCalled();
  });

  it('_validarReglasNegocio carga la estructura y valida (NUEVO fuera del primer periodo falla)', async () => {
    const { useCase } = crear({
      periodRepository: {
        findAll: jest.fn().mockResolvedValue({ periods: [{ id: 1, number: 1 }, { id: 2, number: 2 }] }),
      },
      prerequisiteRepository: { findAll: jest.fn().mockResolvedValue({ prerequisites: [] }) },
      subjectRepository: { findAll: jest.fn().mockResolvedValue({ subjects: [{ id: 10, acronym: 'MAT' }] }) },
    });
    useCase.transferRepository.findAll.mockResolvedValue({ transfers: [] });
    useCase.planSubjectRepository.findAll.mockResolvedValue({
      planSubjects: [{ id: 100, subjectId: 10, periodId: 2 }],
    });
    await expect(
      useCase._validarReglasNegocio({
        student: { id: 5 },
        studyPlan: { id: 1 },
        offerRows: [{ curriculumSubjectId: 100 }],
        enrollmentType: 'NUEVO',
        priorHistory: [],
        historialFilas: [],
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('CreateEnrollmentUseCase · modo materias', () => {
  it('_getParallelFromFirstTeacherAssignment recorre asignación, oferta y paralelo-gestión', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(plano({ offerCourseId: 4 }));
    deps.courseOfferRepository.findById.mockResolvedValue(plano({ parallelManagementId: 6 }));
    deps.parallelManagementRepository.findById.mockResolvedValue(plano({ parallelId: 9 }));
    expect(await useCase._getParallelFromFirstTeacherAssignment(1)).toEqual({ parallel: { id: 9, name: 'A', careerId: 8 } });
  });

  it('devuelve parallel null cuando falta algún eslabón', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue({});
    expect(await useCase._getParallelFromFirstTeacherAssignment(1)).toEqual({ parallel: null });
    deps.teacherAssignmentRepository.findById.mockResolvedValue({ ofertaCursoId: 4 });
    deps.courseOfferRepository.findById.mockResolvedValue({});
    expect(await useCase._getParallelFromFirstTeacherAssignment(1)).toEqual({ parallel: null });
    deps.courseOfferRepository.findById.mockResolvedValue({ paraleloGestionId: 6 });
    deps.parallelManagementRepository.findById.mockResolvedValue({});
    expect(await useCase._getParallelFromFirstTeacherAssignment(1)).toEqual({ parallel: null });
  });

  it('lanza NotFound si falta asignación, oferta o paralelo-gestión', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
    await expect(useCase._getParallelFromFirstTeacherAssignment(1)).rejects.toBeInstanceOf(NotFoundError);
    deps.teacherAssignmentRepository.findById.mockResolvedValue({ offerCourseId: 4 });
    deps.courseOfferRepository.findById.mockResolvedValue(null);
    await expect(useCase._getParallelFromFirstTeacherAssignment(1)).rejects.toBeInstanceOf(NotFoundError);
    deps.courseOfferRepository.findById.mockResolvedValue({ parallelManagementId: 6 });
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(useCase._getParallelFromFirstTeacherAssignment(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('_validateAndResolveTeacherAssignments exige que pertenezcan al plan habilitado', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById
      .mockResolvedValueOnce(plano({ managementPlanId: 2 }))
      .mockResolvedValueOnce(plano({ gestionPlanId: 2 }));
    expect(await useCase._validateAndResolveTeacherAssignments([1, 2], 2)).toHaveLength(2);

    deps.teacherAssignmentRepository.findById.mockResolvedValueOnce({ managementPlanId: 99 });
    await expect(useCase._validateAndResolveTeacherAssignments([3], 2)).rejects.toThrow('no pertenece al plan habilitado');
    deps.teacherAssignmentRepository.findById.mockResolvedValueOnce(null);
    await expect(useCase._validateAndResolveTeacherAssignments([4], 2)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('_offerRowsFromTeacherAssignments elimina ofertas repetidas y valida vínculos', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValue(plano({ asignaturaPlanId: 50 }));
    const rows = await useCase._offerRowsFromTeacherAssignments([
      plano({ id: 1, offerCourseId: 4 }),
      { id: 2, ofertaCursoId: 4 },
    ]);
    expect(rows).toEqual([{ offerCourseId: 4, curriculumSubjectId: 50 }]);

    await expect(useCase._offerRowsFromTeacherAssignments([{ id: 3 }])).rejects.toThrow('no está vinculada');
    deps.courseOfferRepository.findById.mockResolvedValue(null);
    await expect(useCase._offerRowsFromTeacherAssignments([{ id: 3, offerCourseId: 7 }])).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase._offerRowsFromTeacherAssignments([])).rejects.toThrow('No se pudieron resolver');
  });
});

describe('CreateEnrollmentUseCase · oferta del paralelo', () => {
  it('_getCourseOfferRowsFromParallel devuelve solo ofertas activas', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(plano({ id: 6 }));
    deps.courseOfferRepository.findEnrichedByParallelManagementId.mockResolvedValue([
      { id: 1, asignaturaPlanId: 10, activo: true },
      { id: 2, asignaturaPlanId: 11, activo: false },
      { id: 3, asignaturaPlanId: 12, activo: 0 },
    ]);
    expect(await useCase._getCourseOfferRowsFromParallel({ id: 9 }, { id: 2 })).toEqual([
      { offerCourseId: 1, curriculumSubjectId: 10 },
    ]);
  });

  it('falla si el paralelo no está instanciado o no tiene oferta', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(null);
    await expect(useCase._getCourseOfferRowsFromParallel({ id: 9, name: 'A' }, { id: 2 })).rejects.toThrow('no está instanciado');
    deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue({ id: 6 });
    deps.courseOfferRepository.findEnrichedByParallelManagementId.mockResolvedValue([]);
    await expect(useCase._getCourseOfferRowsFromParallel({ id: 9 }, { id: 2 })).rejects.toThrow('no tiene materias ofertadas');
  });
});

describe('CreateEnrollmentUseCase · selección por periodo', () => {
  const parallelIdsByPeriod = { 1: 9, 2: 9 };
  const materiaIdsByPeriod = { 1: [10, 11], 2: [] };
  const student = { id: 5 };
  const management = { id: 3, year: 2026 };

  const preparar = () => {
    const ctx = crear();
    jest.spyOn(ctx.useCase, '_getOrCreateStudentAcademicData').mockResolvedValue({ id: 20 });
    jest.spyOn(ctx.useCase, '_getStudyPlanAndManagementPlan').mockResolvedValue({
      studyPlan: { id: 1 },
      managementPlan: { id: 2 },
    });
    ctx.deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(plano({ id: 6 }));
    ctx.deps.courseOfferRepository.findEnrichedByParallelManagementId.mockResolvedValue([
      { id: 100, periodoId: 1, materiaId: 10, asignaturaPlanId: 1000 },
      { id: 100, periodoId: 1, materiaId: 10, asignaturaPlanId: 1000 },
      { id: 101, periodoId: 1, materiaId: 99 },
      { id: 102, periodoId: 3, materiaId: 11 },
      { id: 103, periodoId: 1, materiaId: 11, planSubjectId: 1003, activo: false },
      { id: 'x', periodoId: 1, materiaId: 11 },
    ]);
    return ctx;
  };

  it('resuelve ids de asignación docente con la oferta que coincide', async () => {
    const { useCase, deps } = preparar();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({
      teacherAssignments: [plano({ id: 77 })],
    });
    const ids = await useCase._resolveTeacherAssignmentIdsFromSelection(
      parallelIdsByPeriod,
      materiaIdsByPeriod,
      student,
      management
    );
    expect(ids).toEqual([77, 77, 77, 77]);
    expect(deps.teacherAssignmentRepository.findAll).toHaveBeenCalledWith(
      { managementPlanId: 2, offerCourseId: 100, active: true },
      1,
      null
    );
  });

  it('sin asignaciones vigentes devuelve []; datos incompletos devuelven []', async () => {
    const { useCase, deps } = preparar();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({ teacherAssignment: [] });
    expect(
      await useCase._resolveTeacherAssignmentIdsFromSelection(parallelIdsByPeriod, materiaIdsByPeriod, student, management)
    ).toEqual([]);
    expect(await useCase._resolveTeacherAssignmentIdsFromSelection({}, { 1: [] }, student, management)).toEqual([]);
    expect(await useCase._resolveTeacherAssignmentIdsFromSelection({}, { 1: [10] }, student, management)).toEqual([]);
    deps.parallelRepository.findById.mockResolvedValue(null);
    expect(
      await useCase._resolveTeacherAssignmentIdsFromSelection(parallelIdsByPeriod, materiaIdsByPeriod, student, management)
    ).toEqual([]);
  });

  it('_resolveOfferRowsFromSelection filtra por periodo, materia, repetidos y activas', async () => {
    const { useCase, deps } = preparar();
    const rows = await useCase._resolveOfferRowsFromSelection(
      parallelIdsByPeriod,
      { 1: [10, 11] },
      student,
      management
    );
    expect(rows).toEqual([{ offerCourseId: 100, curriculumSubjectId: 1000 }]);
    deps.parallelManagementRepository.findByParallelAndManagementPlan.mockResolvedValue(null);
    expect(
      await useCase._resolveOfferRowsFromSelection(parallelIdsByPeriod, { 1: [10] }, student, management)
    ).toEqual([]);
    expect(await useCase._resolveOfferRowsFromSelection({}, { 1: [] }, student, management)).toEqual([]);
    expect(await useCase._resolveOfferRowsFromSelection({}, { 1: [10] }, student, management)).toEqual([]);
    deps.parallelRepository.findById.mockResolvedValue(null);
    expect(
      await useCase._resolveOfferRowsFromSelection(parallelIdsByPeriod, { 1: [10] }, student, management)
    ).toEqual([]);
  });

  it('execute: sin asignaciones vigentes matricula por oferta de curso', async () => {
    const { useCase, deps } = preparar();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({ teacherAssignments: [] });
    jest.spyOn(useCase, '_asegurarCarreraDatosAcademicos').mockResolvedValue();
    const r = await useCase.execute({
      studentId: 5,
      parallelIdsByPeriod,
      materiaIdsByPeriod: { 1: [10] },
      enrollmentType: 'ANTIGUO',
    });
    expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ offerCourseId: 100, curriculumSubjectId: 1000, status: 'INSCRITO' })
    );
    expect(r.subjectEnrollments).toHaveLength(1);
  });

  it('execute: con asignaciones vigentes pasa al modo materias', async () => {
    const { useCase, deps } = preparar();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({ teacherAssignments: [{ id: 77 }] });
    jest.spyOn(useCase, '_getParallelFromFirstTeacherAssignment').mockResolvedValue({ parallel: { id: 9 } });
    jest.spyOn(useCase, '_validateAndResolveTeacherAssignments').mockResolvedValue([{ id: 77 }]);
    jest.spyOn(useCase, '_offerRowsFromTeacherAssignments').mockResolvedValue([{ offerCourseId: 100, curriculumSubjectId: null }]);
    jest.spyOn(useCase, '_asegurarCarreraDatosAcademicos').mockResolvedValue();
    await useCase.execute({ studentId: 5, parallelIdsByPeriod, materiaIdsByPeriod: { 1: [10] } });
    expect(useCase._validateAndResolveTeacherAssignments).toHaveBeenCalledWith([77, 77], 2);
  });

  it('execute: selección sin oferta ni paralelo da un error claro', async () => {
    const { useCase, deps } = preparar();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({ teacherAssignments: [] });
    deps.courseOfferRepository.findEnrichedByParallelManagementId.mockResolvedValue([]);
    await expect(
      useCase.execute({ studentId: 5, parallelIdsByPeriod, materiaIdsByPeriod: { 1: [10] } })
    ).rejects.toThrow('No hay oferta de curso vigente');
  });

  it('execute: gestión iniciada crea matrículas CURSANDO y abre bimestres', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentRepository.existeCursandoEnGestion.mockResolvedValue(true);
    jest.spyOn(useCase, '_getOrCreateStudentAcademicData').mockResolvedValue({ id: 20 });
    jest.spyOn(useCase, '_getStudyPlanAndManagementPlan').mockResolvedValue({ studyPlan: { id: 1 }, managementPlan: { id: 2 } });
    jest.spyOn(useCase, '_asegurarCarreraDatosAcademicos').mockResolvedValue();
    jest.spyOn(useCase, '_getCourseOfferRowsFromParallel').mockResolvedValue([{ offerCourseId: 1, curriculumSubjectId: 2 }]);
    await useCase.execute({ studentId: 5, parallelId: 9 });
    expect(deps.subjectEnrollmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'CURSANDO' }));
    expect(mockActivar).toHaveBeenCalledWith(expect.objectContaining({ inscripcionId: 70, userId: null }));
  });
});

describe('CreateEnrollmentUseCase · historial previo y plan', () => {
  it('_createPriorEnrollmentHistory no hace nada sin repo o sin items', async () => {
    const { useCase } = crear();
    expect(await useCase._createPriorEnrollmentHistory({ id: 1 }, null, {})).toEqual([]);
    expect(await useCase._createPriorEnrollmentHistory({ id: 1 }, [], {})).toEqual([]);
    const { useCase: sinRepo } = crear({ priorEnrollmentHistoryRepository: null });
    expect(await sinRepo._createPriorEnrollmentHistory({ id: 1 }, [{}], {})).toEqual([]);
  });

  it('registra cada materia concluida contra su asignatura de plan', async () => {
    const { useCase, deps } = crear();
    deps.planSubjectRepository.findAll.mockResolvedValue({ planSubjects: [plano({ id: 500 })] });
    const r = await useCase._createPriorEnrollmentHistory(
      { id: 70 },
      [{ materiaId: 10, periodId: 1, finalGrade: 80 }],
      plano({ studyPlanId: 4 })
    );
    expect(deps.planSubjectRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 4, periodId: 1, subjectId: 10 }, null, null);
    expect(deps.priorEnrollmentHistoryRepository.create).toHaveBeenCalledWith({
      enrollmentId: 70,
      curriculumSubjectId: 500,
      finalGrade: 80,
      status: 'APROBADO',
    });
    expect(r).toHaveLength(1);
  });

  it('falla sin plan de estudios o sin asignatura de plan', async () => {
    const { useCase, deps } = crear();
    await expect(
      useCase._createPriorEnrollmentHistory({ id: 70 }, [{ materiaId: 10, periodId: 1, finalGrade: 80 }], {})
    ).rejects.toThrow('No se pudo resolver el plan');
    deps.planSubjectRepository.findAll.mockResolvedValue({ planSubjects: [] });
    await expect(
      useCase._createPriorEnrollmentHistory({ id: 70 }, [{ materiaId: 10, periodId: 1, finalGrade: 80 }], { planEstudioId: 4 })
    ).rejects.toThrow('No se encontró asignatura de plan');
  });

  it('_getStudyPlanAndManagementPlan delega en la regla de planes duales', async () => {
    const { useCase, deps } = crear();
    deps.studyPlanRepository.findAll.mockResolvedValue({ studyPlans: [{ id: 1 }] });
    deps.managementPlanRepository.findAll.mockResolvedValue({ managementPlans: [{ id: 2 }] });
    const r = await useCase._getStudyPlanAndManagementPlan({ careerId: 8 }, { id: 3 });
    expect(r).toEqual({ studyPlan: { id: 1 }, managementPlan: { id: 2 } });
  });

  it('_buildResponse aplana entidades con toPlainObject', () => {
    const { useCase } = crear();
    const r = useCase._buildResponse(plano({ id: 1 }), [plano({ id: 2 })], 5, 9, { id: 3 }, [plano({ id: 3 })]);
    expect(r.enrollment).toEqual({ id: 1 });
    expect(r.subjectEnrollments).toEqual([{ id: 2 }]);
    expect(r.priorEnrollmentHistories).toEqual([{ id: 3 }]);
  });
});
