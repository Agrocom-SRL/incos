import { describe, it, expect, jest } from '@jest/globals';
import { GetCuadernoBimestreUseCase } from '../../../src/application/use-cases/academico/GetCuadernoBimestreUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetCuadernoBimestreUseCase', () => {
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
        obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(11),
        listarColumnasAsistenciaBimestre: jest.fn().mockResolvedValue([]),
        listarEvaluaciones: jest.fn().mockResolvedValue([
          {
            id: 40,
tipo_evaluacion_id: 5,
componente: 'TEORICO',
nombre_evaluacion: 'Examen',
            puntos: '10',
fecha: '2026-03-01',
notas_cerradas: 0,
          },
          {
            id: 41,
tipo_evaluacion_id: 6,
componente: 'PRACTICO',
nombre_evaluacion: 'Taller',
            puntos: 20,
fecha: null,
notas_cerradas: 1,
          },
        ]),
        listarNotasCuaderno: jest.fn().mockResolvedValue([
          { estudiante_id: '5', evaluacion_id: '40', nota: '8' },
          { estudiante_id: 6, evaluacion_id: 41, nota: null },
        ]),
      },
      subjectEnrollmentBimesterRepository: {
        asegurarBimestresMatriculaCurso: jest.fn().mockResolvedValue(undefined),
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
      },
      asistenciaPlanillaViewRepository: {
        listarAsistenciaBimestreCurso: jest.fn().mockResolvedValue([]),
      },
      bimesterEvaluationGradeRepository: { upsertNotaCelda: jest.fn() },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetCuadernoBimestreUseCase(deps) };
  };

  const entrada = (over = {}) => ({ usuarioId: 1, asignacionId: 20, bimestre: 2, ...over });

  it('devuelve evaluaciones y notas mapeadas', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada());

    expect(res).toEqual({
      bimestre: 2,
      reabierto: false,
      evaluaciones: [
        { id: 40, tipoEvaluacionId: 5, nombre: 'Examen', componente: 'TEORICO', puntos: 10, fecha: '2026-03-01', notasCerradas: false },
        { id: 41, tipoEvaluacionId: 6, nombre: 'Taller', componente: 'PRACTICO', puntos: 20, fecha: null, notasCerradas: true },
      ],
      notas: [
        { estudianteId: 5, evaluacionId: 40, nota: 8 },
        { estudianteId: 6, evaluacionId: 41, nota: null },
      ],
    });
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 2);
    expect(deps.cuadernoRepository.listarEvaluaciones).toHaveBeenCalledWith(20, 11);
    expect(deps.cuadernoRepository.listarNotasCuaderno).toHaveBeenCalledWith(20, 2);
    expect(deps.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso)
      .toHaveBeenCalledWith(20, 2, 1);
  });

  it('indica reabierto cuando hay matrículas reabiertas', async () => {
    const { useCase, deps } = crear();
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(3);
    const res = await useCase.execute(entrada({ bimestre: 1 }));
    expect(res.reabierto).toBe(true);
    expect(deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso)
      .toHaveBeenCalledWith(20, 1);
  });

  it('devuelve listas vacías si no hay evaluaciones', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarEvaluaciones.mockResolvedValue([]);
    deps.cuadernoRepository.listarNotasCuaderno.mockResolvedValue([]);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ evaluaciones: [], notas: [] });
  });

  it('sincroniza la asistencia antes de leer las notas cuando el bimestre es editable', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarColumnasAsistenciaBimestre.mockResolvedValue([
      { evaluacionId: 41, puntos: 10, periodoAcademicoId: 11, fechaInicio: 'a', fechaFin: 'b' },
    ]);
    deps.asistenciaPlanillaViewRepository.listarAsistenciaBimestreCurso.mockResolvedValue([]);
    await useCase.execute(entrada());
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).toHaveBeenCalledWith(20, 3, 2);
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre.mock.invocationCallOrder[0])
      .toBeLessThan(deps.cuadernoRepository.listarNotasCuaderno.mock.invocationCallOrder[0]);
  });

  it('no recalcula asistencia en un bimestre cerrado', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    await useCase.execute(entrada());
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).not.toHaveBeenCalled();
  });

  it('un fallo en la sincronización de asistencia no rompe la lectura', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarColumnasAsistenciaBimestre.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ bimestre: 2 });
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it.each([0, 5, 'x', undefined])('lanza NotFoundError con bimestre fuera de 1..4 (%s)', async (bimestre) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ bimestre }))).rejects.toThrow(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza NotFoundError si no hay periodo académico del bimestre', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
    expect(deps.cuadernoRepository.listarEvaluaciones).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
  });

  it('permite a coordinación', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue(null);
    deps.authRepository.tienePermiso.mockResolvedValue(true);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ bimestre: 2 });
  });
});
