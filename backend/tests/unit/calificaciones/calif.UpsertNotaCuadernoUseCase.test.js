import { describe, it, expect, jest } from '@jest/globals';
import { UpsertNotaCuadernoUseCase } from '../../../src/application/use-cases/academico/UpsertNotaCuadernoUseCase.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('UpsertNotaCuadernoUseCase', () => {
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
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
        asegurarBimestreMatriculaId: jest.fn().mockResolvedValue(50),
      },
      bimesterEvaluationGradeRepository: {
        upsertNotaCelda: jest.fn(async ({ nota }) => ({ nota })),
        eliminarNotaCelda: jest.fn().mockResolvedValue(undefined),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpsertNotaCuadernoUseCase(deps) };
  };

  const entrada = (body = {}, over = {}) => ({
    usuarioId: 1,
    asignacionId: 20,
    bimestre: 2,
    body: { estudianteId: 5, evaluacionId: 40, nota: 8, ...body },
    ...over,
  });

  it('guarda la nota de la celda', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada());

    expect(res).toEqual({ estudianteId: 5, evaluacionId: 40, nota: 8 });
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).toHaveBeenCalledWith(40, 20);
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 2);
    expect(deps.subjectEnrollmentBimesterRepository.asegurarBimestreMatriculaId)
      .toHaveBeenCalledWith(20, 5, 2, 1);
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).toHaveBeenCalledWith({
      evaluacionId: 40, bimestreMatriculaId: 50, nota: 8, usuarioId: 1,
    });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('acepta nota 0 y la nota máxima de la actividad', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ nota: 0 }))).resolves.toMatchObject({ nota: 0 });
    await expect(useCase.execute(entrada({ nota: '10' }))).resolves.toMatchObject({ nota: 10 });
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).toHaveBeenCalledTimes(2);
  });

  it.each([null, '', undefined])('nota vacía (%j) elimina la celda', async (nota) => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada({ nota }));
    expect(res).toEqual({ estudianteId: 5, evaluacionId: 40, nota: null });
    expect(deps.bimesterEvaluationGradeRepository.eliminarNotaCelda).toHaveBeenCalledWith(40, 50, 1);
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).not.toHaveBeenCalled();
  });

  it.each([-1, 11, 7.5, 'abc'])('rechaza la nota fuera de rango o no entera (%s)', async (nota) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ nota }))).rejects.toThrow(ValidationError);
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).not.toHaveBeenCalled();
  });

  it.each([0, 5, 'x', undefined])('rechaza bimestre inválido (%s)', async (bimestre) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({}, { bimestre }))).rejects.toThrow('Bimestre inválido');
  });

  it.each([undefined, 0, 'x'])('exige estudiante (%s)', async (estudianteId) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ estudianteId }))).rejects.toThrow('Estudiante requerido');
  });

  it.each([undefined, 0, 'x'])('exige evaluación (%s)', async (evaluacionId) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ evaluacionId }))).rejects.toThrow('Evaluación requerida');
  });

  it('lanza NotFoundError si la evaluación no existe', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza NotFoundError si el estudiante no tiene matrícula en el curso/bimestre', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentBimesterRepository.asegurarBimestreMatriculaId.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
    expect(deps.bimesterEvaluationGradeRepository.upsertNotaCelda).not.toHaveBeenCalled();
  });

  it('rechaza una evaluación de otro periodo académico', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({
      id: 40, puntos: 10, notas_cerradas: 0, periodo_academico_id: 12,
    });
    await expect(useCase.execute(entrada())).rejects.toThrow(/no corresponde al bimestre/);
  });

  it('rechaza una actividad sin puntos configurados', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({
      id: 40, puntos: 0, notas_cerradas: 0, periodo_academico_id: 11,
    });
    await expect(useCase.execute(entrada())).rejects.toThrow(/no tiene puntos/);
  });

  it('bloquea notas cerradas salvo bimestre reabierto', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({
      id: 40, puntos: 10, notas_cerradas: 1, periodo_academico_id: 11,
    });
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);

    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ nota: 8 });
  });

  it('bloquea el bimestre cerrado o no abierto antes de tocar la BD de notas', async () => {
    const { useCase, deps } = crear();
    for (const estado of ['CERRADO', 'PENDIENTE', null]) {
      deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue(estado);
      await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    }
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError sin acceso al curso y NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);

    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('falla si no hay gestión vigente', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toMatchObject({ statusCode: 404 });
  });
});
