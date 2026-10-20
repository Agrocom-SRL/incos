import { describe, it, expect, jest } from '@jest/globals';
import { DeleteEvaluacionCuadernoUseCase } from '../../../src/application/use-cases/academico/DeleteEvaluacionCuadernoUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteEvaluacionCuadernoUseCase', () => {
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
        listarFilasCalculoBimestre: jest.fn().mockResolvedValue([
          { bimestreMatriculaId: 50, componente: 'TEORICO', nota: 8 },
          { bimestreMatriculaId: 50, componente: 'PRACTICO', nota: 20 },
        ]),
        listarResumenNotasPorMatricula: jest.fn().mockResolvedValue([
          { matricula_materia_id: 500, bimestre: 1, nota_bimestre: 80 },
          { matricula_materia_id: 500, bimestre: 2, nota_bimestre: 60 },
        ]),
      },
      subjectEnrollmentRepository: {
        actualizarNotaFinalMatricula: jest.fn().mockResolvedValue(undefined),
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
        listarBimestresMatriculaIdsCurso: jest.fn().mockResolvedValue([50, 51]),
        actualizarComponentesBimestreMatricula: jest.fn().mockResolvedValue(undefined),
      },
      bimesterEvaluationGradeRepository: {
        softEliminarNotasPorEvaluacion: jest.fn().mockResolvedValue(undefined),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      bimesterEvaluationRepository: { delete: jest.fn().mockResolvedValue(true) },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteEvaluacionCuadernoUseCase(deps) };
  };

  const entrada = (over = {}) => ({
    usuarioId: 1, asignacionId: 20, bimestre: 2, evaluacionId: 40, ...over,
  });

  it('borra notas, recalcula bimestre y nota final, y elimina la evaluación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada());

    expect(res).toEqual({ id: 40 });
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion)
      .toHaveBeenCalledWith(40, 1);
    expect(deps.cuadernoRepository.listarFilasCalculoBimestre).toHaveBeenCalledWith(20, 2);
    const act = deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula;
    expect(act).toHaveBeenCalledWith(50, { teorico: 8, practico: 20, bimestre: 28 }, 1);
    expect(act).toHaveBeenCalledWith(51, { teorico: null, practico: null, bimestre: null }, 1);
    expect(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula)
      .toHaveBeenCalledWith(500, 70, 1);
    expect(deps.bimesterEvaluationRepository.delete).toHaveBeenCalledWith(40, 1);
  });

  it('elimina la evaluación después de borrar sus notas y recalcular', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada());
    const orden = (fn) => fn.mock.invocationCallOrder[0];
    expect(orden(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion))
      .toBeLessThan(orden(deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula));
    expect(orden(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula))
      .toBeLessThan(orden(deps.bimesterEvaluationRepository.delete));
  });

  it('lanza NotFoundError si la evaluación no existe en la asignación', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).toHaveBeenCalledWith(40, 20);
    expect(deps.bimesterEvaluationRepository.delete).not.toHaveBeenCalled();
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza NotFoundError si asignacionId es inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ asignacionId: 'abc' }))).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError si no es el docente ni coordinación', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    expect(deps.bimesterEvaluationRepository.delete).not.toHaveBeenCalled();
  });

  it('bloquea bimestres no vigentes sin reapertura', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ bimestre: 3 }))).rejects.toThrow(/vigente o reabierto/);
    expect(deps.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion).not.toHaveBeenCalled();
  });

  it('permite eliminar en bimestre reabierto aunque no sea el vigente', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada({ bimestre: 1 }))).resolves.toEqual({ id: 40 });
  });

  it('bloquea evaluaciones cerradas salvo reapertura', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({ id: 40, notas_cerradas: 1 });
    await expect(useCase.execute(entrada())).rejects.toThrow(/cerrada/);
    expect(deps.bimesterEvaluationRepository.delete).not.toHaveBeenCalled();

    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada())).resolves.toEqual({ id: 40 });
  });
});
