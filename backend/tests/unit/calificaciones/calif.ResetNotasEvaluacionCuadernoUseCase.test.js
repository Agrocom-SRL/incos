import { describe, it, expect, jest } from '@jest/globals';
import { ResetNotasEvaluacionCuadernoUseCase } from '../../../src/application/use-cases/academico/ResetNotasEvaluacionCuadernoUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ResetNotasEvaluacionCuadernoUseCase', () => {
  const crear = () => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue({ docente_id: 7 }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue({ gestion_id: 3, bimestre_vigente: 2 }),
      },
      cuadernoRepository: {
        obtenerEvaluacionDeAsignacion: jest.fn().mockResolvedValue({ id: 40, notas_cerradas: 0 }),
        listarFilasCalculoBimestre: jest.fn().mockResolvedValue([]),
        listarResumenNotasPorMatricula: jest.fn().mockResolvedValue([
          { matricula_materia_id: 500, bimestre: 1, nota_bimestre: 80 },
        ]),
      },
      subjectEnrollmentRepository: {
        actualizarNotaFinalMatricula: jest.fn().mockResolvedValue(undefined),
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
        listarBimestresMatriculaIdsCurso: jest.fn().mockResolvedValue([50, 51, 52]),
        actualizarComponentesBimestreMatricula: jest.fn().mockResolvedValue(undefined),
      },
      bimesterEvaluationGradeRepository: {
        softEliminarNotasPorEvaluacion: jest.fn().mockResolvedValue(undefined),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ResetNotasEvaluacionCuadernoUseCase(deps) };
  };

  const entrada = (over = {}) => ({
    usuarioId: 1, asignacionId: 20, bimestre: 2, evaluacionId: 40, ...over,
  });

  it('restablece notas, recalcula y devuelve el resumen', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada());

    expect(res).toEqual({ evaluacionId: 40, estudiantesActualizados: 3, matriculasActualizadas: 1 });
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion)
      .toHaveBeenCalledWith(40, 1);
    expect(deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula)
      .toHaveBeenCalledTimes(3);
    expect(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula)
      .toHaveBeenCalledWith(500, 80, 1);
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('lanza NotFoundError si la evaluación no existe', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).toHaveBeenCalledWith(40, 20);
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso al curso', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion).not.toHaveBeenCalled();
  });

  it('bloquea bimestres no vigentes sin reapertura', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ bimestre: 4 }))).rejects.toThrow(/vigente o reabierto/);
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion).not.toHaveBeenCalled();
  });

  it('permite bimestre reabierto no vigente', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada({ bimestre: 1 }))).resolves.toMatchObject({ evaluacionId: 40 });
  });

  it('bloquea notas cerradas salvo reapertura', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({ id: 40, notas_cerradas: 1 });
    await expect(useCase.execute(entrada())).rejects.toThrow(/cerradas/);
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ evaluacionId: 40 });
  });
});
