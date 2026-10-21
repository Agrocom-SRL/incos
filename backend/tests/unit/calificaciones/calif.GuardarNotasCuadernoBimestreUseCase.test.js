import { describe, it, expect, jest } from '@jest/globals';
import { GuardarNotasCuadernoBimestreUseCase } from '../../../src/application/use-cases/academico/GuardarNotasCuadernoBimestreUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GuardarNotasCuadernoBimestreUseCase', () => {
  const crear = () => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue({ docente_id: 7 }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue({ gestion_id: 3, bimestre_vigente: 2 }),
        obtenerEstadoInstitucionalBimestre: jest.fn().mockResolvedValue('EN_CURSO'),
      },
      cuadernoRepository: {
        obtenerEvaluacionDeAsignacion: jest.fn().mockResolvedValue({
          id: 40, puntos: 10, notas_cerradas: 0, periodo_academico_id: 11,
        }),
        obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(11),
        listarColumnasAsistenciaBimestre: jest.fn().mockResolvedValue([]),
        listarFilasCalculoBimestre: jest.fn().mockResolvedValue([
          { bimestreMatriculaId: 50, componente: 'TEORICO', nota: 6 },
          { bimestreMatriculaId: 50, componente: 'PRACTICO', nota: 30 },
        ]),
        listarResumenNotasPorMatricula: jest.fn().mockResolvedValue([
          { matricula_materia_id: 500, bimestre: 2, nota_bimestre: 36 },
        ]),
      },
      subjectEnrollmentRepository: {
        actualizarNotaFinalMatricula: jest.fn().mockResolvedValue(undefined),
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
        asegurarBimestresMatriculaCurso: jest.fn().mockResolvedValue(undefined),
        asegurarBimestreMatriculaId: jest.fn(async (_a, estudianteId) => 50 + (estudianteId - 5)),
        listarBimestresMatriculaIdsCurso: jest.fn().mockResolvedValue([50, 51]),
        actualizarComponentesBimestreMatricula: jest.fn().mockResolvedValue(undefined),
      },
      bimesterEvaluationGradeRepository: {
        upsertNotaCelda: jest.fn(async ({ nota }) => ({ nota })),
        eliminarNotaCelda: jest.fn().mockResolvedValue(undefined),
      },
      asistenciaPlanillaViewRepository: {
        listarAsistenciaBimestreCurso: jest.fn().mockResolvedValue([]),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GuardarNotasCuadernoBimestreUseCase(deps) };
  };

  const entrada = (notas, over = {}) => ({
    usuarioId: 1, asignacionId: 20, bimestre: 2, body: { notas }, ...over,
  });
  const lote = [
    { estudianteId: 5, evaluacionId: 40, nota: 8 },
    { estudianteId: 6, evaluacionId: 40, nota: null },
  ];

  it('guarda el lote y recalcula bimestre y nota final', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada(lote));

    expect(res.notas).toEqual([
      { estudianteId: 5, evaluacionId: 40, nota: 8 },
      { estudianteId: 6, evaluacionId: 40, nota: null },
    ]);
    expect(res).toMatchObject({
      notasGuardadas: 2,
      columnasAsistencia: 0,
      celdasAsistencia: 0,
      estudiantesActualizados: 2,
      matriculasActualizadas: 1,
    });
    expect(deps.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso)
      .toHaveBeenCalledWith(20, 2, 1);
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).toHaveBeenCalledWith({
      evaluacionId: 40, bimestreMatriculaId: 50, nota: 8, usuarioId: 1,
    });
    expect(deps.bimesterEvaluationGradeRepository.eliminarNotaCelda).toHaveBeenCalledWith(40, 51, 1);
    expect(deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula)
      .toHaveBeenCalledWith(50, { teorico: 6, practico: 30, bimestre: 36 }, 1);
    expect(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula)
      .toHaveBeenCalledWith(500, 36, 1);
  });

  it('recalcula aunque el lote venga vacío o sin arreglo', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada([]))).resolves.toMatchObject({ notasGuardadas: 0 });
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 20, bimestre: 2, body: {} }))
      .resolves.toMatchObject({ notasGuardadas: 0, notas: [] });
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).not.toHaveBeenCalled();
    expect(deps.cuadernoRepository.listarFilasCalculoBimestre).toHaveBeenCalledTimes(2);
  });

  it('recalcula la columna de asistencia proporcional antes de sumar', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarColumnasAsistenciaBimestre.mockResolvedValue([
      { evaluacionId: 41, puntos: 10, periodoAcademicoId: 11, fechaInicio: '2026-03-01', fechaFin: '2026-04-30' },
    ]);
    deps.asistenciaPlanillaViewRepository.listarAsistenciaBimestreCurso.mockResolvedValue([
      { estudiante_id: 5, sesiones_tomadas: 10, faltas_no_neutralizadas: 2 },
    ]);
    const res = await useCase.execute(entrada([]));

    expect(deps.asistenciaPlanillaViewRepository.listarAsistenciaBimestreCurso)
      .toHaveBeenCalledWith(20, 11, 3, '2026-03-01', '2026-04-30');
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).toHaveBeenCalledWith({
      evaluacionId: 41, bimestreMatriculaId: 50, nota: 8, usuarioId: 1,
    });
    expect(res).toMatchObject({ columnasAsistencia: 1, celdasAsistencia: 1 });
  });

  it.each([0, 5, 'x', undefined])('rechaza bimestre inválido (%s)', async (bimestre) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada(lote, { bimestre }))).rejects.toThrow('Bimestre inválido');
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it('rechaza el lote con estudiante o evaluación inválidos', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada([{ estudianteId: 0, evaluacionId: 40, nota: 1 }])))
      .rejects.toThrow('Estudiante inválido en el lote');
    await expect(useCase.execute(entrada([{ estudianteId: 5, evaluacionId: 'x', nota: 1 }])))
      .rejects.toThrow('Evaluación inválida en el lote');
    expect(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula).not.toHaveBeenCalled();
  });

  it('un elemento nulo del lote se rechaza como estudiante inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada([null]))).rejects.toThrow('Estudiante inválido en el lote');
  });

  it('propaga NotFoundError si una evaluación del lote no existe y no recalcula', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada(lote))).rejects.toThrow(NotFoundError);
    expect(deps.cuadernoRepository.listarFilasCalculoBimestre).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada(lote))).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso o con bimestre cerrado', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    await expect(useCase.execute(entrada(lote))).rejects.toThrow(ForbiddenError);
    expect(deps.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso).not.toHaveBeenCalled();

    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada(lote))).rejects.toThrow(ForbiddenError);
  });

  it('permite coordinación y bimestre reabierto', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    deps.authRepository.tienePermiso.mockResolvedValue(true);
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada(lote))).resolves.toMatchObject({ notasGuardadas: 2 });
  });
});
