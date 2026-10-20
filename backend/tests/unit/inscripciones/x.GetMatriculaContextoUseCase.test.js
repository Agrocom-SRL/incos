import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockResolverPlan = jest.fn();
const mockCargarEstructura = jest.fn();
const mockCuotas = jest.fn();
const realRules = await import('../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js');
jest.unstable_mockModule('../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js', () => ({
  ...realRules,
  resolverPlanEstudioInscripcion: mockResolverPlan,
  cargarEstructuraPlan: mockCargarEstructura,
}));
jest.unstable_mockModule('../../../src/application/utils/obtenerCuotasDesdePolitica.js', () => ({
  cargarCuotasPoliticaGestion: mockCuotas,
}));

const { GetMatriculaContextoUseCase } = await import(
  '../../../src/application/use-cases/inscripciones/GetMatriculaContextoUseCase.js'
);
const { NotFoundError, ValidationError } = await import('../../../src/domain/errors/AppError.js');

describe('GetMatriculaContextoUseCase', () => {
  const estructura = () => ({
    periodoById: new Map([
      [1, { id: 1, numero: 1, nombre: 'Primero' }],
      [2, { id: 2, numero: 2, nombre: 'Segundo' }],
    ]),
    planSubjects: [
      { id: 11, subjectId: 101, periodId: 1, displayOrder: 1, weeklyHours: 4 },
      { id: 12, subjectId: 102, periodId: 2, displayOrder: 1, weeklyHours: 3 },
    ],
    planSubjectById: new Map([
      [11, { id: 11, subjectId: 101 }],
      [12, { id: 12, subjectId: 102 }],
    ]),
    materiaById: new Map([
      [101, { id: 101, acronym: 'ENF-101', name: 'Anatomia' }],
      [102, { id: 102, acronym: 'ENF-102', name: 'Fisiologia' }],
    ]),
    siglaByMateriaId: new Map([[101, 'ENF-101'], [102, 'ENF-102']]),
    prereqPlanSubjectIdByPlanSubjectId: new Map([[12, 11]]),
  });

  const crear = () => {
    const deps = {
      studentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, studentCode: 'E1', firstName: 'Ana', lastName: 'Lopez', motherLastName: 'Rios', ci: '123' }),
      },
      studentAcademicDataRepository: {
        findAll: jest.fn().mockResolvedValue({ studentAcademicData: [{ id: 20, careerId: 8, admissionType: 'NUEVO' }] }),
      },
      enrollmentRepository: {
        count: jest.fn().mockResolvedValue(0),
        findAll: jest.fn().mockResolvedValue({ enrollments: [] }),
      },
      transferRepository: { findAll: jest.fn().mockResolvedValue({ transfers: [] }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026, name: 'G2026' }) },
      managementPlanRepository: {
        findPlanesDocenteAsignacionCatalog: jest.fn().mockResolvedValue({
          rows: [
            { carreraId: 8, planEstudioId: 6, planNombre: 'Plan 2024', planVigente: 1 },
            { carreraId: 9, planEstudioId: 7, planNombre: 'Otra carrera' },
            { carreraId: 8, planEstudioId: null },
          ],
        }),
      },
      studyPlanRepository: {},
      careerRepository: { findById: jest.fn().mockResolvedValue({ id: 8, name: 'Enfermeria', code: 'ENF' }) },
      periodRepository: {},
      planSubjectRepository: {},
      subjectRepository: {},
      prerequisiteRepository: {},
      historialAcademicoRepository: { listarFilasHistorialPorEstudiante: jest.fn().mockResolvedValue([]) },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      evaluationConfigurationRepository: undefined,
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new GetMatriculaContextoUseCase(deps) };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolverPlan.mockResolvedValue({ studyPlan: { id: 6, planName: 'Plan 2024', isActive: true } });
    mockCargarEstructura.mockImplementation(async () => estructura());
  });

  it('arma el contexto para un estudiante nuevo sin historial', async () => {
    const { useCase, deps } = crear();
    const ctx = await useCase.execute({ estudianteId: 5 });

    expect(deps.configuracionSistemaRepository.findBy).toHaveBeenCalledWith({ key: 'gestion_actual' });
    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });
    expect(ctx.estudiante).toEqual(
      expect.objectContaining({
        id: 5,
        nombreCompleto: 'Lopez Rios Ana',
        carreraId: 8,
        carreraNombre: 'Enfermeria',
        tipoAdmision: 'NUEVO',
        esNuevoSistema: true,
        traspasoAnioCursado: null,
        yaMatriculadoGestionActual: false,
      })
    );
    expect(ctx.gestion).toEqual({ id: 3, anio: 2026, nombre: 'G2026' });
    expect(ctx.carrera).toEqual({ id: 8, nombre: 'Enfermeria', codigo: 'ENF' });
    expect(ctx.planes).toEqual([{ id: 6, nombre: 'Plan 2024', resolucionMinisterial: null, vigente: true }]);
    expect(ctx.plan).toEqual({ id: 6, nombre: 'Plan 2024', vigente: true });
    expect(ctx.notaMinimaAprobacion).toBe(61);
    expect(ctx.resumenHistorial).toEqual({ totalAprobadas: 0, totalPendientes: 2, minPeriodoPendiente: null });
    expect(ctx.periodos.map((p) => p.numero)).toEqual([1, 2]);
    expect(ctx.periodos[1].asignaturas[0]).toEqual(
      expect.objectContaining({
        asignaturaPlanId: 12,
        sigla: 'ENF-102',
        horasSemanales: 3,
        prerrequisito: { asignaturaPlanId: 11, materiaId: 101, sigla: 'ENF-101' },
        estadoHistorial: null,
      })
    );
  });

  it('con historial: marca la mejor anotación y calcula el primer periodo pendiente', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.count.mockResolvedValue(1);
    deps.historialAcademicoRepository.listarFilasHistorialPorEstudiante.mockResolvedValue([
      { asignatura_plan_id: 11, estado: 'REPROBADO', nota_final: 30, gestion_anio: 2024 },
      { asignatura_plan_id: 11, estado: 'APROBADO', nota_final: 75, gestion_anio: 2025 },
      { asignatura_sigla: 'enf-102', estado: 'REPROBADO', nota_final: 40, gestion_anio: 2025 },
      { asignatura_plan_id: 99, estado: 'CURSANDO', gestion_anio: 2026 },
    ]);
    const ctx = await useCase.execute({ estudianteId: 5 });

    expect(ctx.estudiante.esNuevoSistema).toBe(false);
    expect(ctx.periodos[0].asignaturas[0]).toEqual(expect.objectContaining({ estadoHistorial: 'APROBADO', notaFinal: 75 }));
    expect(ctx.periodos[1].asignaturas[0]).toEqual(expect.objectContaining({ estadoHistorial: 'REPROBADO', notaFinal: 40 }));
    expect(ctx.resumenHistorial).toEqual({ totalAprobadas: 1, totalPendientes: 1, minPeriodoPendiente: 2 });
  });

  it('detecta si ya está matriculado en la gestión, salvo la inscripción excluida', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findAll.mockResolvedValue({ enrollments: [{ id: 44 }] });

    const ctx = await useCase.execute({ estudianteId: 5 });
    expect(deps.enrollmentRepository.findAll).toHaveBeenCalledWith({ academicDataId: 20, managementId: 3 }, null, null);
    expect(ctx.estudiante.yaMatriculadoGestionActual).toBe(true);

    const ctx2 = await useCase.execute({ estudianteId: 5, excluirInscripcionId: '44' });
    expect(ctx2.estudiante.yaMatriculadoGestionActual).toBe(false);
  });

  it('con inscripción excluida el total de inscripciones la descuenta', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findAll.mockResolvedValue({ enrollments: [{ id: 44 }] });
    const ctx = await useCase.execute({ estudianteId: 5, excluirInscripcionId: 44 });
    expect(ctx.estudiante.esNuevoSistema).toBe(true);
    expect(deps.enrollmentRepository.count).not.toHaveBeenCalled();
  });

  it('usa el año del último traspaso', async () => {
    const { useCase, deps } = crear();
    deps.transferRepository.findAll.mockResolvedValue({ transfers: [{ anioCursado: 2022 }, { anioCursado: 2023 }] });
    const ctx = await useCase.execute({ estudianteId: 5 });
    expect(ctx.estudiante.traspasoAnioCursado).toBe(2023);
  });

  it('estudiante inexistente: NotFoundError', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ estudianteId: 99 })).rejects.toThrow(NotFoundError);
  });

  it('carrera distinta a la registrada: ValidationError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ estudianteId: 5, carreraId: 9 })).rejects.toThrow(ValidationError);
  });

  it('sin carrera registrada exige carreraId', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findAll.mockResolvedValue({ studentAcademicData: [] });
    await expect(useCase.execute({ estudianteId: 5 })).rejects.toThrow(ValidationError);

    const ctx = await useCase.execute({ estudianteId: 5, carreraId: '8' });
    expect(deps.careerRepository.findById).toHaveBeenLastCalledWith(8);
    expect(ctx.estudiante.carreraId).toBeNull();
    expect(ctx.estudiante.carreraNombre).toBeNull();
    expect(ctx.estudiante.yaMatriculadoGestionActual).toBe(false);
  });

  it('carrera inexistente: NotFoundError', async () => {
    const { useCase, deps } = crear();
    deps.careerRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ estudianteId: 5 })).rejects.toThrow(NotFoundError);
  });

  it('gestión actual no configurada, inválida (NaN) o sin gestión vigente: ValidationError', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ estudianteId: 5 })).rejects.toThrow(ValidationError);

    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    await expect(useCase.execute({ estudianteId: 5 })).rejects.toThrow(ValidationError);
    expect(deps.managementRepository.findBy).not.toHaveBeenCalled();

    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: '2026' });
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute({ estudianteId: 5 })).rejects.toThrow(ValidationError);
  });

  it('la nota mínima sale de la política de evaluación y cae a 61 si falla o no es numérica', async () => {
    const { deps } = crear();
    deps.evaluationConfigurationRepository = {};
    const uc = new GetMatriculaContextoUseCase(deps);

    mockCuotas.mockResolvedValue({ notaMinimaAprobacion: 51 });
    expect((await uc.execute({ estudianteId: 5 })).notaMinimaAprobacion).toBe(51);
    expect(mockCuotas).toHaveBeenCalledWith(expect.objectContaining({ gestionId: 3 }));

    mockCuotas.mockResolvedValue({ notaMinimaAprobacion: NaN });
    expect((await uc.execute({ estudianteId: 5 })).notaMinimaAprobacion).toBe(61);

    mockCuotas.mockRejectedValue(new Error('x'));
    expect((await uc.execute({ estudianteId: 5 })).notaMinimaAprobacion).toBe(61);
    expect(deps.logger.warn).toHaveBeenCalled();
  });
});
