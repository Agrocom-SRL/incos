import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockDerivarCarrera = jest.fn();
const realRules = await import('../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js');
jest.unstable_mockModule('../../../src/application/use-cases/inscripciones/enrollmentBusinessRules.js', () => ({
  ...realRules,
  derivarCarreraPlanDesdeMatriculas: mockDerivarCarrera,
}));

const { GetEnrollmentByIdUseCase } = await import(
  '../../../src/application/use-cases/inscripciones/GetEnrollmentByIdUseCase.js'
);

describe('GetEnrollmentByIdUseCase', () => {
  const crear = ({ tipo = 'ANTIGUO', careerId = 8 } = {}) => {
    const deps = {
      enrollmentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 4, academicDataId: 20, managementId: 3, enrollmentType: tipo }),
      },
      subjectEnrollmentRepository: {
        findAll: jest.fn().mockResolvedValue({
          subjectEnrollments: [{ id: 1, offerCourseId: 100, curriculumSubjectId: 11, status: 'INSCRITO' }],
        }),
      },
      studentAcademicDataRepository: {
        findById: jest.fn().mockResolvedValue({ id: 20, studentId: 5, careerId }),
      },
      studentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, studentCode: 'E1', firstName: 'Ana', lastName: 'Lopez' }),
      },
      careerRepository: { findById: jest.fn().mockResolvedValue({ id: 8, code: 'ENF', name: 'Enfermeria' }) },
      studyPlanRepository: {},
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 3, name: 'G2026', year: 2026 }) },
      teacherAssignmentRepository: {
        findAll: jest.fn().mockResolvedValue({ teacherAssignments: [{ id: 9, teacherId: 12 }] }),
      },
      courseOfferRepository: {
        findById: jest.fn().mockResolvedValue({ id: 100, planSubjectId: 11, parallelManagementId: 50 }),
      },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 50, parallelId: 9 }) },
      planSubjectRepository: {
        findById: jest.fn().mockResolvedValue({ id: 11, subjectId: 101, periodId: 1 }),
      },
      subjectRepository: { findById: jest.fn().mockResolvedValue({ id: 101, name: 'Anatomia', acronym: 'ENF-101' }) },
      asignacionHorarioRepository: {
        findBloquesByOfertaCursoIdForPresentation: jest.fn().mockResolvedValue([
          { id: 1, dia: 'LUNES', horaInicio: '08:00', horaFin: '09:30', aulaCodigo: 'A1' },
        ]),
      },
      teacherRepository: {
        findById: jest.fn().mockResolvedValue({ id: 12, firstName: 'Luis', lastName: 'Paz', colorHex: '#ff0000' }),
      },
      parallelRepository: { findById: jest.fn().mockResolvedValue({ id: 9, name: 'A', shift: 'MAÑANA' }) },
      studentDocumentRepository: { findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }) },
      priorEnrollmentHistoryRepository: {
        findAll: jest.fn().mockResolvedValue({
          priorEnrollmentHistories: [{ id: 1, enrollmentId: 4, curriculumSubjectId: 11, finalGrade: 80, status: 'APROBADO' }],
        }),
      },
      periodRepository: { findById: jest.fn().mockResolvedValue({ id: 1, name: 'Primero' }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    };
    return { deps, useCase: new GetEnrollmentByIdUseCase(deps) };
  };

  beforeEach(() => jest.clearAllMocks());

  it('arma la ficha completa con materias, docente, paralelo, horarios e historial previo', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(4);

    expect(deps.enrollmentRepository.findById).toHaveBeenCalledWith(4, expect.any(Object));
    expect(res.enrollment).toEqual(expect.objectContaining({ id: 4, datosAcademicosId: 20, gestionId: 3 }));
    expect(res.student).toEqual(expect.objectContaining({ id: 5, codigoEstudiante: 'E1' }));
    expect(res.career).toEqual(expect.objectContaining({ codigo: 'ENF', nombre: 'Enfermeria' }));
    expect(res.management).toEqual(expect.objectContaining({ nombre: 'G2026', anio: 2026 }));

    expect(res.subjectEnrollments).toHaveLength(1);
    expect(res.subjectEnrollments[0]).toEqual(
      expect.objectContaining({
        materiaId: 101,
        materiaNombre: 'Anatomia',
        materiaSigla: 'ENF-101',
        periodoId: 1,
        paraleloId: 9,
        color: '#ff0000',
        paralelo: { id: 9, nombre: 'A', turno: 'MAÑANA' },
        docente: expect.objectContaining({ id: 12, nombreCompleto: 'Luis Paz' }),
        horarios: [expect.objectContaining({ dia: 'LUNES', aula: { codigo: 'A1', nombre: null } })],
      })
    );
    expect(res.selectedPeriodIds).toEqual([1]);
    expect(res.parallelIdsByPeriod).toEqual({ 1: 9 });
    expect(res.materiaIdsByPeriod).toEqual({ 1: [101] });
    expect(res.requiereHistorialPrevio).toBe(true);
    expect(res.cantidadHistorialPrevio).toBe(1);
    expect(res.historialPrevioEstado).toBe('REGISTRADO');
    expect(res.priorEnrollmentHistories[0]).toEqual(
      expect.objectContaining({ asignaturaPlanId: 11, notaFinal: 80, estado: 'APROBADO', materiaNombre: 'Anatomia', periodName: 'Primero' })
    );
    expect(res.formularioInscripcion).toBeUndefined();
  });

  it('inscripción inexistente rechaza y no consulta el resto', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toMatchObject({ statusCode: 404, message: /Inscripción con ID 99/ });
    expect(deps.studentAcademicDataRepository.findById).not.toHaveBeenCalled();
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('datos académicos, gestión, estudiante o carrera inexistentes rechazan', async () => {
    let c = crear();
    c.deps.studentAcademicDataRepository.findById.mockResolvedValue(null);
    await expect(c.useCase.execute(4)).rejects.toMatchObject({ statusCode: 404, message: /Datos académicos/ });

    c = crear();
    c.deps.managementRepository.findById.mockResolvedValue(null);
    await expect(c.useCase.execute(4)).rejects.toMatchObject({ statusCode: 404, message: /Gestión/ });

    c = crear();
    c.deps.studentRepository.findById.mockResolvedValue(null);
    await expect(c.useCase.execute(4)).rejects.toMatchObject({ statusCode: 404, message: /Estudiante/ });

    c = crear();
    c.deps.careerRepository.findById.mockResolvedValue(null);
    await expect(c.useCase.execute(4)).rejects.toMatchObject({ statusCode: 404, message: /Carrera/ });
  });

  it('historial previo: NO_APLICA para NUEVO y PENDIENTE para ANTIGUO sin filas', async () => {
    let c = crear({ tipo: 'NUEVO' });
    c.deps.priorEnrollmentHistoryRepository.findAll.mockResolvedValue({ priorEnrollmentHistories: [] });
    let res = await c.useCase.execute(4);
    expect(res.requiereHistorialPrevio).toBe(false);
    expect(res.historialPrevioEstado).toBe('NO_APLICA');

    c = crear({ tipo: 'TRASPASO' });
    c.deps.priorEnrollmentHistoryRepository.findAll.mockResolvedValue({ priorEnrollmentHistories: [] });
    res = await c.useCase.execute(4);
    expect(res.requiereHistorialPrevio).toBe(true);
    expect(res.historialPrevioEstado).toBe('PENDIENTE');
  });

  it('una materia que falla al resolverse no rompe la ficha (se degrada con aviso)', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockRejectedValue(new Error('x'));
    const res = await useCase.execute(4);
    expect(res.subjectEnrollments).toHaveLength(1);
    expect(res.subjectEnrollments[0].materiaId).toBeNull();
    expect(res.subjectEnrollments[0].docente).toBeNull();
    expect(res.selectedPeriodIds).toBeUndefined();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('sin oferta usa la asignatura de plan directa', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentRepository.findAll.mockResolvedValue({
      subjectEnrollments: [{ id: 2, curriculumSubjectId: 11 }],
    });
    const res = await useCase.execute(4);
    expect(deps.courseOfferRepository.findById).not.toHaveBeenCalled();
    expect(res.subjectEnrollments[0]).toEqual(expect.objectContaining({ materiaId: 101, paralelo: null, horarios: [] }));
  });

  it('sin carrera en datos académicos la deriva desde las materias matriculadas', async () => {
    const { useCase, deps } = crear({ careerId: null });
    mockDerivarCarrera.mockResolvedValue({ careerId: 8, studyPlanId: 6 });
    const res = await useCase.execute(4);
    expect(mockDerivarCarrera).toHaveBeenCalledWith(expect.objectContaining({ enrollmentId: 4 }));
    expect(deps.careerRepository.findById).toHaveBeenCalledWith(8, expect.any(Object));
    expect(res.career).toEqual(expect.objectContaining({ codigo: 'ENF' }));
  });

  it('expone el formulario de inscripción PDF más reciente', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.findAll.mockResolvedValue({
      studentDocuments: [
        { tipoDocumento: 'INSCRIPCION', fileName: 'FORMULARIO_INSCRIPCION_1.pdf', filePath: 'viejo.pdf', createdAt: '2026-01-01' },
        { tipoDocumento: 'INSCRIPCION', fileName: 'FORMULARIO_INSCRIPCION_2.pdf', filePath: '/nuevo.pdf', createdAt: '2026-03-01' },
        { tipoDocumento: 'INSCRIPCION', fileName: 'otra.png', filePath: 'x.png', createdAt: '2026-04-01' },
      ],
    });
    const res = await useCase.execute(4);
    expect(deps.studentDocumentRepository.findAll).toHaveBeenCalledWith(
      { studentId: 5, tipoDocumento: 'INSCRIPCION', includeInactive: true },
      null,
      null
    );
    expect(res.formularioInscripcion).toEqual({ filePath: '/nuevo.pdf', fileName: 'FORMULARIO_INSCRIPCION_2.pdf' });
  });

  it('un error al buscar documentos no impide devolver la ficha', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.findAll.mockRejectedValue(new Error('x'));
    const res = await useCase.execute(4);
    expect(res.formularioInscripcion).toBeUndefined();
    expect(res.student.id).toBe(5);
  });
});
