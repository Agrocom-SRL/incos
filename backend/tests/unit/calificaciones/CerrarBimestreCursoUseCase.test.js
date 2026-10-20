import { jest } from '@jest/globals';
import { CerrarBimestreCursoUseCase } from '../../../src/application/use-cases/academico/CerrarBimestreCursoUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CerrarBimestreCursoUseCase', () => {
  const crear = ({ curso = { docente_id: 7 }, esCoordinacion = false } = {}) => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue(curso),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest
          .fn()
          .mockResolvedValue({ gestion_id: 3, bimestre_vigente: 2 }),
      },
      cuadernoRepository: {
        listarColumnasAsistenciaBimestre: jest.fn().mockResolvedValue([]),
        listarFilasCalculoBimestre: jest.fn().mockResolvedValue([]),
        listarResumenNotasPorMatricula: jest.fn().mockResolvedValue([]),
      },
      subjectEnrollmentRepository: {
        actualizarNotaFinalMatricula: jest.fn().mockResolvedValue(undefined),
      },
      subjectEnrollmentBimesterRepository: {
        listarBimestresMatriculaIdsCurso: jest.fn().mockResolvedValue([100, 101]),
        actualizarComponentesBimestreMatricula: jest.fn().mockResolvedValue(undefined),
        cerrarBimestreCurso: jest.fn().mockResolvedValue(undefined),
      },
      bimesterEvaluationGradeRepository: { upsertNotaCelda: jest.fn() },
      asistenciaPlanillaViewRepository: { listarAsistenciaBimestreCurso: jest.fn() },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(esCoordinacion) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CerrarBimestreCursoUseCase(deps) };
  };

  it('recalcula y cierra el bimestre del curso, y devuelve el resumen', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarResumenNotasPorMatricula.mockResolvedValue([
      { matricula_materia_id: 50, bimestre: 1, nota_bimestre: 80 },
    ]);

    const result = await useCase.execute({ usuarioId: 1, asignacionId: '10', bimestreNum: '2' });

    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).toHaveBeenCalledWith(10, 3, 2);
    expect(deps.cuadernoRepository.listarFilasCalculoBimestre).toHaveBeenCalledWith(10, 2);
    expect(deps.subjectEnrollmentBimesterRepository.listarBimestresMatriculaIdsCurso)
      .toHaveBeenCalledWith(10, 2);
    expect(deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula)
      .toHaveBeenCalledTimes(2);
    expect(deps.subjectEnrollmentRepository.actualizarNotaFinalMatricula)
      .toHaveBeenCalledWith(50, expect.anything(), 1);
    expect(deps.subjectEnrollmentBimesterRepository.cerrarBimestreCurso)
      .toHaveBeenCalledWith(10, 2, 1);
    expect(result).toEqual({
      bimestre: 2,
      cerrado: true,
      columnasAsistencia: 0,
      celdasAsistencia: 0,
      estudiantesActualizados: 2,
      matriculasActualizadas: 1,
    });
  });

  it('cierra solo después de haber recalculado notas', async () => {
    const { useCase, deps } = crear();
    const orden = [];
    deps.subjectEnrollmentBimesterRepository.actualizarComponentesBimestreMatricula
      .mockImplementation(async () => { orden.push('componentes'); });
    deps.subjectEnrollmentBimesterRepository.cerrarBimestreCurso
      .mockImplementation(async () => { orden.push('cerrar'); });

    await useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 });
    expect(orden).toEqual(['componentes', 'componentes', 'cerrar']);
  });

  it('permite cerrar a coordinación aunque no sea el docente del curso', async () => {
    const { useCase, deps } = crear({ curso: { docente_id: 99 }, esCoordinacion: true });
    const result = await useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 });
    expect(result.cerrado).toBe(true);
    expect(deps.authRepository.tienePermiso)
      .toHaveBeenCalledWith(1, 'academico.calificacion.coordinacion', 'LISTAR');
  });

  it('rechaza con Forbidden si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear({ curso: { docente_id: 99 } });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.subjectEnrollmentBimesterRepository.cerrarBimestreCurso).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el curso no existe', async () => {
    const { useCase, deps } = crear({ curso: null });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.subjectEnrollmentBimesterRepository.cerrarBimestreCurso).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['x'], [undefined]])('rechaza el bimestre inválido %s', async (bimestreNum) => {
    const { useCase, deps } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestreNum }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
    expect(deps.subjectEnrollmentBimesterRepository.cerrarBimestreCurso).not.toHaveBeenCalled();
  });
});
