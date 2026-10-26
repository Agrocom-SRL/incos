import { describe, it, expect, jest } from '@jest/globals';
import {
  derivarPlanIdDesdeKardex,
  resolverPlanEstudioInscripcion,
  construirCoberturaAprobadas,
  calcularMinPeriodoPendiente,
  cargarEstructuraPlan,
  validarReglasInscripcion,
  derivarCarreraPlanDesdeMatriculas,
} from '../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('derivarPlanIdDesdeKardex', () => {
  it('sin historial devuelve null', () => {
    expect(derivarPlanIdDesdeKardex(null)).toBeNull();
    expect(derivarPlanIdDesdeKardex([])).toBeNull();
  });

  it('toma el plan del último año con plan conocido', () => {
    expect(
      derivarPlanIdDesdeKardex([
        { plan_estudio_id: 1, gestion_anio: 2024 },
        { plan_estudio_id: 2, gestion_anio: 2026 },
        { plan_estudio_id: null, gestion_anio: 2030 },
        { plan_estudio_id: 3, gestion_anio: 2025 },
      ])
    ).toBe(2);
  });

  it('filas sin plan conocido devuelven null', () => {
    expect(derivarPlanIdDesdeKardex([{ gestion_anio: 2024 }])).toBeNull();
  });
});

describe('resolverPlanEstudioInscripcion', () => {
  const management = { id: 3, year: 2026 };
  const crear = ({ plans = {}, vigentes = [], managementPlans = [{ id: 50 }] } = {}) => ({
    studyPlanRepository: {
      findById: jest.fn(async (id) => plans[id] ?? null),
      findAll: jest.fn().mockResolvedValue({ studyPlans: vigentes }),
    },
    managementPlanRepository: {
      findAll: jest.fn().mockResolvedValue({ managementPlans }),
    },
    logger: { warn: jest.fn() },
  });

  it('el plan del kardex manda sobre el solicitado (RN-3) y avisa', async () => {
    const deps = crear({ plans: { 1: { id: 1, careerId: 5 }, 2: { id: 2, careerId: 5 } } });
    const r = await resolverPlanEstudioInscripcion({
      requestedPlanId: 2,
      careerId: 5,
      management,
      historialFilas: [{ plan_estudio_id: 1, gestion_anio: 2025 }],
      ...deps,
    });
    expect(r.origenPlan).toBe('KARDEX');
    expect(r.studyPlan.id).toBe(1);
    expect(deps.logger.warn).toHaveBeenCalled();
    expect(deps.managementPlanRepository.findAll).toHaveBeenCalledWith(
      { managementId: 3, studyPlanId: 1, active: true },
      null,
      null
    );
  });

  it('kardex de otra carrera se descarta y se usa el solicitado', async () => {
    const deps = crear({ plans: { 1: { id: 1, carreraId: 9 }, 2: { id: 2, careerId: 5 } } });
    const r = await resolverPlanEstudioInscripcion({
      requestedPlanId: 2,
      careerId: 5,
      management,
      historialFilas: [{ plan_estudio_id: 1, gestion_anio: 2025 }],
      ...deps,
    });
    expect(r.origenPlan).toBe('SOLICITADO');
  });

  it('con preferKardexOverRequested=false el solicitado tiene prioridad', async () => {
    const deps = crear({ plans: { 1: { id: 1, careerId: 5 }, 2: { id: 2, careerId: 5 } } });
    const r = await resolverPlanEstudioInscripcion({
      requestedPlanId: 2,
      careerId: 5,
      management,
      historialFilas: [{ plan_estudio_id: 1, gestion_anio: 2025 }],
      preferKardexOverRequested: false,
      ...deps,
    });
    expect(r.studyPlan.id).toBe(2);
  });

  it('con preferKardexOverRequested=false y sin solicitado usa el derivado', async () => {
    const deps = crear({ plans: { 1: { id: 1, careerId: 5 } } });
    const r = await resolverPlanEstudioInscripcion({
      careerId: 5,
      management,
      historialFilas: [{ plan_estudio_id: 1, gestion_anio: 2025 }],
      preferKardexOverRequested: false,
      ...deps,
    });
    expect(r.origenPlan).toBe('KARDEX');
  });

  it('plan solicitado inexistente o de otra carrera es ValidationError', async () => {
    const deps = crear({ plans: { 2: { id: 2, careerId: 8 } } });
    await expect(
      resolverPlanEstudioInscripcion({ requestedPlanId: 7, careerId: 5, management, ...deps })
    ).rejects.toThrow(/no está disponible/);
    await expect(
      resolverPlanEstudioInscripcion({ requestedPlanId: 2, careerId: 5, management, ...deps })
    ).rejects.toThrow(/no pertenece a la carrera/);
  });

  it('sin kardex ni solicitado usa el plan vigente de la carrera', async () => {
    const deps = crear({ vigentes: [{ id: 9, careerId: 5 }] });
    const r = await resolverPlanEstudioInscripcion({ careerId: 5, management, ...deps });
    expect(r.origenPlan).toBe('VIGENTE');
    expect(deps.studyPlanRepository.findAll).toHaveBeenCalledWith(
      { careerId: 5, active: true, sort: 'vigente:DESC' },
      null,
      null
    );
  });

  it('sin plan vigente es NotFoundError', async () => {
    const deps = crear({ vigentes: [] });
    await expect(
      resolverPlanEstudioInscripcion({ careerId: 5, management, ...deps })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('plan no habilitado en la gestión: ValidationError si fue solicitado, NotFound si no', async () => {
    const solicitado = crear({ plans: { 2: { id: 2, careerId: 5 } }, managementPlans: [] });
    await expect(
      resolverPlanEstudioInscripcion({ requestedPlanId: 2, careerId: 5, management, ...solicitado })
    ).rejects.toBeInstanceOf(ValidationError);
    const vigente = crear({ vigentes: [{ id: 9 }], managementPlans: [] });
    await expect(
      resolverPlanEstudioInscripcion({ careerId: 5, management, ...vigente })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('construirCoberturaAprobadas', () => {
  const planSubjectByMateriaPeriodo = new Map([['10:2', { id: 100 }]]);
  const planSubjectById = new Map([[200, { id: 200, subjectId: 20 }]]);
  const siglaByMateriaId = new Map([
    [10, 'mat'],
    [20, 'fis'],
  ]);

  it('combina kardex, prior_history y historial persistido', () => {
    const r = construirCoberturaAprobadas({
      historialFilas: [
        { estado: 'aprobado', asignatura_plan_id: 1, asignatura_sigla: ' qui ' },
        { estado: 'REPROBADO', asignatura_plan_id: 2, asignatura_sigla: 'LEN' },
      ],
      priorHistoryItems: [
        { materiaId: 10, periodId: 2, status: 'CONVALIDADO' },
        { materia_id: 10, period_id: 2, estado: 'REPROBADO' },
        { materiaId: 'x', periodId: 2 },
        null,
      ],
      priorCurriculumSubjectIds: [200, 'zz'],
      planSubjectByMateriaPeriodo,
      planSubjectById,
      siglaByMateriaId,
    });
    expect([...r.aprobadasPlanSubjectIds].sort()).toEqual([1, 100, 200]);
    expect([...r.aprobadasSiglas].sort()).toEqual(['FIS', 'MAT', 'QUI']);
  });

  it('sin entradas opcionales devuelve conjuntos vacíos', () => {
    const r = construirCoberturaAprobadas({ planSubjectByMateriaPeriodo, planSubjectById, siglaByMateriaId });
    expect(r.aprobadasPlanSubjectIds.size).toBe(0);
    expect(r.aprobadasSiglas.size).toBe(0);
  });
});

describe('calcularMinPeriodoPendiente', () => {
  const periodoById = new Map([
    [1, { numero: 1 }],
    [2, { numero: 2 }],
  ]);

  it('devuelve el menor periodo con materias no aprobadas', () => {
    const planSubjects = [
      { id: 1, periodId: 1 },
      { id: 2, periodoId: 2 },
      { id: 3, periodId: 99 },
    ];
    expect(
      calcularMinPeriodoPendiente({ planSubjects, periodoById, estaAprobada: (ps) => ps.id === 1 })
    ).toBe(2);
  });

  it('todo aprobado o plan vacío devuelve null', () => {
    expect(calcularMinPeriodoPendiente({ planSubjects: [], periodoById, estaAprobada: () => false })).toBeNull();
    expect(
      calcularMinPeriodoPendiente({ planSubjects: [{ id: 1, periodId: 1 }], periodoById, estaAprobada: () => true })
    ).toBeNull();
  });
});

describe('cargarEstructuraPlan', () => {
  const plano = (o) => ({ toPlainObject: () => o });

  it('indexa periodos, asignaturas, materias y prerrequisitos', async () => {
    const subjectRepository = { findAll: jest.fn().mockResolvedValue({ subjects: [plano({ id: 10, acronym: 'MAT' }), { id: 20, sigla: 'FIS' }] }) };
    const e = await cargarEstructuraPlan({
      studyPlanId: 4,
      periodRepository: { findAll: jest.fn().mockResolvedValue({ periods: [plano({ id: 1, number: 1, name: 'P1' }), { id: 2, numero: 2, nombre: 'P2' }] }) },
      planSubjectRepository: {
        findAll: jest.fn().mockResolvedValue({
          planSubjects: [
            plano({ id: 100, subjectId: 10, periodId: 1 }),
            { id: 200, materiaId: 20, periodoId: 2 },
            { id: 300, subjectId: null, periodId: null },
          ],
        }),
      },
      subjectRepository,
      prerequisiteRepository: {
        findAll: jest.fn().mockResolvedValue({
          prerequisites: [plano({ subjectId: 200, prerequisiteId: 100 }), { asignaturaId: 'x', prerrequisitoId: 1 }],
        }),
      },
    });
    expect(subjectRepository.findAll).toHaveBeenCalledWith({ id: [10, 20] }, null, null);
    expect(e.periodoById.get(2)).toEqual({ id: 2, numero: 2, nombre: 'P2' });
    expect(e.siglaByMateriaId.get(20)).toBe('FIS');
    expect(e.planSubjectByMateriaPeriodo.get('10:1').id).toBe(100);
    expect(e.prereqPlanSubjectIdByPlanSubjectId.get(200)).toBe(100);
    expect(e.prereqPlanSubjectIdByPlanSubjectId.size).toBe(1);
  });

  it('sin asignaturas no consulta materias', async () => {
    const subjectRepository = { findAll: jest.fn() };
    const vacio = { findAll: jest.fn().mockResolvedValue({}) };
    const e = await cargarEstructuraPlan({
      studyPlanId: 1,
      periodRepository: vacio,
      planSubjectRepository: vacio,
      subjectRepository,
      prerequisiteRepository: vacio,
    });
    expect(subjectRepository.findAll).not.toHaveBeenCalled();
    expect(e.planSubjects).toEqual([]);
  });
});

describe('validarReglasInscripcion', () => {
  // Plan: P1 {MAT(100), FIS(101)}, P2 {QUI(200, requiere MAT)}, P3 {LEN(300)}
  const estructura = (() => {
    const periodoById = new Map([
      [1, { id: 1, numero: 1, nombre: 'Primero' }],
      [2, { id: 2, numero: 2, nombre: 'Segundo' }],
      [3, { id: 3, numero: 3, nombre: 'Tercero' }],
    ]);
    const planSubjects = [
      { id: 100, subjectId: 10, periodId: 1 },
      { id: 101, subjectId: 11, periodId: 1 },
      { id: 200, subjectId: 20, periodId: 2 },
      { id: 300, subjectId: 30, periodId: 3 },
    ];
    return {
      planSubjects,
      periodoById,
      planSubjectById: new Map(planSubjects.map((p) => [p.id, p])),
      planSubjectByMateriaPeriodo: new Map(planSubjects.map((p) => [`${p.subjectId}:${p.periodId}`, p])),
      siglaByMateriaId: new Map([[10, 'MAT'], [11, 'FIS'], [20, 'QUI'], [30, 'LEN']]),
      prereqPlanSubjectIdByPlanSubjectId: new Map([[200, 100]]),
    };
  })();

  const validar = (o) =>
    validarReglasInscripcion({ enrollmentType: 'ANTIGUO', esNuevoSistema: false, estructura, ...o });

  it('sin materias no valida nada', () => {
    expect(() => validar({ curriculumSubjectIds: [] })).not.toThrow();
    expect(() => validar({ curriculumSubjectIds: undefined })).not.toThrow();
  });

  it('rechaza materia ya aprobada en el kardex', () => {
    expect(() =>
      validar({
        curriculumSubjectIds: [100],
        historialFilas: [{ estado: 'APROBADO', asignatura_plan_id: 100 }],
      })
    ).toThrow(/ya figura como aprobada/);
  });

  it('rechaza materia aprobada en kardex por sigla', () => {
    expect(() =>
      validar({
        curriculumSubjectIds: [101],
        historialFilas: [{ estado: 'CONVALIDADO', asignatura_sigla: 'fis' }],
      })
    ).toThrow(/FIS/);
  });

  it('prerrequisito no cubierto falla; cubierto por prior_history pasa', () => {
    expect(() => validar({ curriculumSubjectIds: [200] })).toThrow(/requiere MAT aprobada/);
    expect(() =>
      validar({
        curriculumSubjectIds: [200],
        priorHistoryItems: [{ materiaId: 10, periodId: 1, status: 'APROBADO' }],
      })
    ).not.toThrow();
  });

  it('prerrequisito cubierto por sigla del kardex', () => {
    expect(() =>
      validar({ curriculumSubjectIds: [200], historialFilas: [{ estado: 'APROBADO', asignatura_sigla: 'MAT' }] })
    ).not.toThrow();
  });

  it('NUEVO solo puede inscribir el primer periodo', () => {
    expect(() =>
      validar({ curriculumSubjectIds: [100, 101], enrollmentType: 'NUEVO', esNuevoSistema: true })
    ).not.toThrow();
    expect(() =>
      validar({ curriculumSubjectIds: [101, 300], enrollmentType: 'NUEVO', esNuevoSistema: true })
    ).toThrow(/estudiantes nuevos/);
  });

  it('TRASPASO bloquea periodos ya cursados según anio_cursado', () => {
    expect(() =>
      validar({
        curriculumSubjectIds: [200],
        enrollmentType: 'TRASPASO',
        esNuevoSistema: true,
        traspasoAnioCursado: 'SEGUNDO',
        priorHistoryItems: [{ materiaId: 10, periodId: 1 }],
      })
    ).toThrow(/traspaso/);
    expect(() =>
      validar({
        curriculumSubjectIds: [200],
        enrollmentType: 'TRASPASO',
        esNuevoSistema: true,
        traspasoAnioCursado: 'PRIMERO',
        priorHistoryItems: [{ materiaId: 10, periodId: 1 }],
      })
    ).not.toThrow();
  });

  it('TRANSITABILIDAD no matricula el primer periodo', () => {
    expect(() =>
      validar({ curriculumSubjectIds: [101], enrollmentType: 'TRANSITABILIDAD', esNuevoSistema: true })
    ).toThrow(/transitabilidad/);
  });

  it('salto máximo: no pasa de minPendiente + 1 y agrupa errores sin duplicar', () => {
    // Pendiente más bajo = P1 -> máximo permitido P2, así que P3 (LEN) se rechaza.
    expect(() => validar({ curriculumSubjectIds: [300] })).toThrow(/regularizar las materias pendientes/);
    // Con P1 aprobado, el pendiente es P2 -> P3 permitido.
    const aprobadoP1 = [
      { estado: 'APROBADO', asignatura_plan_id: 100 },
      { estado: 'APROBADO', asignatura_plan_id: 101 },
    ];
    expect(() => validar({ curriculumSubjectIds: [300, 200], historialFilas: aprobadoP1 })).not.toThrow();
  });

  it('une varios incumplimientos en un único ValidationError', () => {
    try {
      validar({ curriculumSubjectIds: [200, 300] });
      throw new Error('debía fallar');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.message).toMatch(/requiere MAT/);
      expect(e.message).toMatch(/regularizar/);
    }
  });

  it('asignatura sin sigla conocida cae a "asignatura <id>"', () => {
    const sinSigla = { ...estructura, siglaByMateriaId: new Map() };
    expect(() =>
      validarReglasInscripcion({
        curriculumSubjectIds: [200],
        enrollmentType: 'ANTIGUO',
        esNuevoSistema: false,
        estructura: sinSigla,
      })
    ).toThrow(/asignatura 200/);
  });
});

describe('derivarCarreraPlanDesdeMatriculas', () => {
  const crear = (o = {}) => ({
    enrollmentId: 1,
    subjectEnrollmentRepository: {
      findAll: jest.fn().mockResolvedValue({
        subjectEnrollments: [{ toPlainObject: () => ({ curriculumSubjectId: 7 }) }],
      }),
    },
    courseOfferRepository: { findById: jest.fn() },
    planSubjectRepository: { findById: jest.fn().mockResolvedValue({ studyPlanId: 3 }) },
    studyPlanRepository: { findById: jest.fn().mockResolvedValue({ careerId: 5 }) },
    logger: { warn: jest.fn() },
    ...o,
  });

  it('deriva carrera y plan desde la asignatura matriculada', async () => {
    expect(await derivarCarreraPlanDesdeMatriculas(crear())).toEqual({ careerId: 5, studyPlanId: 3 });
  });

  it('sin dependencias o sin id devuelve null sin consultar', async () => {
    expect(await derivarCarreraPlanDesdeMatriculas({ enrollmentId: null })).toBeNull();
    expect(await derivarCarreraPlanDesdeMatriculas(crear({ studyPlanRepository: null }))).toBeNull();
  });

  it('sin matrículas devuelve null y avisa', async () => {
    const deps = crear({ subjectEnrollmentRepository: { findAll: jest.fn().mockResolvedValue({}) } });
    expect(await derivarCarreraPlanDesdeMatriculas(deps)).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('resuelve desde la oferta de curso cuando la matrícula no trae asignatura de plan', async () => {
    const deps = crear({
      subjectEnrollmentRepository: { findAll: jest.fn().mockResolvedValue({ subjectEnrollments: [{ offerCourseId: 4 }] }) },
      courseOfferRepository: { findById: jest.fn().mockResolvedValue({ toPlainObject: () => ({ asignaturaPlanId: 8 }) }) },
    });
    expect(await derivarCarreraPlanDesdeMatriculas(deps)).toEqual({ careerId: 5, studyPlanId: 3 });
    expect(deps.planSubjectRepository.findById).toHaveBeenCalledWith(8);
  });

  it('sin oferta resoluble, sin plan o sin carrera devuelve null', async () => {
    const sinOferta = crear({
      subjectEnrollmentRepository: { findAll: jest.fn().mockResolvedValue({ subjectEnrollments: [{}] }) },
    });
    expect(await derivarCarreraPlanDesdeMatriculas(sinOferta)).toBeNull();
    const sinPlan = crear({ planSubjectRepository: { findById: jest.fn().mockResolvedValue(null) } });
    expect(await derivarCarreraPlanDesdeMatriculas(sinPlan)).toBeNull();
    const sinCarrera = crear({ studyPlanRepository: { findById: jest.fn().mockResolvedValue({}) } });
    expect(await derivarCarreraPlanDesdeMatriculas(sinCarrera)).toBeNull();
  });
});
