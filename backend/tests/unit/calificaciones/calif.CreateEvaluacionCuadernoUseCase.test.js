import { describe, it, expect, jest } from '@jest/globals';
import { CreateEvaluacionCuadernoUseCase } from '../../../src/application/use-cases/academico/CreateEvaluacionCuadernoUseCase.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('CreateEvaluacionCuadernoUseCase', () => {
  const crear = (over = {}) => {
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
        listarEvaluaciones: jest.fn().mockResolvedValue([]),
      },
      bimesterEvaluationRepository: {
        create: jest.fn(async (entity) => ({ ...entity.toPlainObject(), id: 99 })),
      },
      evaluationTypeRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, code: 'EXAMEN' }),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      subjectEnrollmentBimesterRepository: {
        asegurarBimestresMatriculaCurso: jest.fn().mockResolvedValue(undefined),
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...over,
    };
    return { deps, useCase: new CreateEvaluacionCuadernoUseCase(deps) };
  };

  const entrada = (body = {}) => ({
    usuarioId: 1,
    asignacionId: 20,
    bimestre: 2,
    body: { tipoEvaluacionId: 5, nombre: ' Examen 1 ', componente: 'TEORICO', puntos: 10, ...body },
  });

  it('crea la evaluación y devuelve el DTO', async () => {
    const { useCase, deps } = crear();
    const dto = await useCase.execute(entrada({ fecha: '2026-03-01' }));

    expect(dto).toEqual({
      id: 99,
      tipoEvaluacionId: 5,
      nombre: 'Examen 1',
      componente: 'TEORICO',
      puntos: 10,
      fecha: '2026-03-01',
      notasCerradas: false,
    });
    const [entity, usuario] = deps.bimesterEvaluationRepository.create.mock.calls[0];
    expect(usuario).toBe(1);
    expect(entity).toMatchObject({
      teacherAssignmentId: 20,
      academicPeriodId: 11,
      evaluationTypeId: 5,
      component: 'TEORICO',
      evaluationName: 'Examen 1',
      points: 10,
      date: '2026-03-01',
      gradesClosed: false,
    });
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 2);
    expect(deps.cuadernoRepository.listarEvaluaciones).toHaveBeenCalledWith(20, 11);
    expect(deps.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso)
      .toHaveBeenCalledWith(20, 2, 1);
  });

  it('sin fecha guarda date null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada());
    expect(deps.bimesterEvaluationRepository.create.mock.calls[0][0].date).toBeNull();
  });

  it.each([0, 5, 'x', undefined])('rechaza bimestre inválido (%s)', async (bimestre) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ ...entrada(), bimestre })).rejects.toThrow(ValidationError);
    expect(deps.bimesterEvaluationRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 8 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    expect(deps.authRepository.tienePermiso)
      .toHaveBeenCalledWith(1, 'academico.calificacion.coordinacion', 'LISTAR');
  });

  it('permite a coordinación aunque no sea el docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 8 }]);
    deps.authRepository.tienePermiso.mockResolvedValue(true);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ id: 99 });
  });

  it('bloquea si el bimestre está cerrado o no abierto', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('PENDIENTE');
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    expect(deps.bimesterEvaluationRepository.create).not.toHaveBeenCalled();
  });

  it('permite bimestre reabierto aunque el estado institucional sea CERRADO', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ id: 99 });
  });

  it('lanza NotFoundError si no hay periodo académico del bimestre', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it.each([undefined, 0, 'abc'])('exige tipo de evaluación (%s)', async (tipoEvaluacionId) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ tipoEvaluacionId }))).rejects.toThrow(
      'Tipo de evaluación requerido'
    );
  });

  it('rechaza un tipo de evaluación inexistente', async () => {
    const { useCase, deps } = crear();
    deps.evaluationTypeRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow('Tipo de evaluación no encontrado');
    expect(deps.evaluationTypeRepository.findById).toHaveBeenCalledWith(5);
  });

  it.each([undefined, '', '   '])('exige nombre descriptivo (%j)', async (nombre) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ nombre }))).rejects.toThrow(
      'Nombre descriptivo requerido'
    );
  });

  it.each([undefined, 'OTRO', 'teorico'])('rechaza componente inválido (%s)', async (componente) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ componente }))).rejects.toThrow('Componente inválido');
  });

  it.each([undefined, 0, 2.5, -1, 'x'])('rechaza puntos inválidos (%s)', async (puntos) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ puntos }))).rejects.toThrow(ValidationError);
    expect(deps.bimesterEvaluationRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si la suma del componente supera la cuota (30 teórico por defecto)', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.listarEvaluaciones.mockResolvedValue([
      { id: 1, componente: 'TEORICO', puntos: 25 },
      { id: 2, componente: 'PRACTICO', puntos: 70 },
    ]);
    await expect(useCase.execute(entrada({ puntos: 6 }))).rejects.toThrow(/supera la cuota de 30/);
    // exactamente la cuota sí pasa
    await expect(useCase.execute(entrada({ puntos: 5 }))).resolves.toMatchObject({ puntos: 5 });
  });

  it('usa la cuota de la política institucional de la gestión', async () => {
    const { useCase, deps } = crear();
    deps.evaluationConfigurationRepository.findActiveRowByGestionId.mockResolvedValue({
      valor: JSON.stringify({ cuotaTeorico: 40, cuotaPractico: 60 }),
    });
    await expect(useCase.execute(entrada({ puntos: 40 }))).resolves.toMatchObject({ puntos: 40 });
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(3);
  });

  describe('tipo ASISTENCIA', () => {
    it('fuerza componente PRACTICO aunque se envíe otro', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue({ id: 5, code: 'ASISTENCIA' });
      const dto = await useCase.execute(entrada({ componente: 'TEORICO', puntos: 10 }));
      expect(dto.componente).toBe('PRACTICO');
      expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).toHaveBeenCalledWith(20, 3, 2);
    });

    it('permite asistencia sin componente en el body', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue({ id: 5, code: 'ASISTENCIA' });
      await expect(useCase.execute(entrada({ componente: undefined }))).resolves.toMatchObject({
        componente: 'PRACTICO',
      });
    });

    it('rechaza una segunda columna de asistencia en el bimestre', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue({ id: 5, code: 'ASISTENCIA' });
      deps.cuadernoRepository.listarColumnasAsistenciaBimestre.mockResolvedValue([{ evaluacionId: 1 }]);
      await expect(useCase.execute(entrada())).rejects.toThrow(/Ya existe una actividad de asistencia/);
      expect(deps.bimesterEvaluationRepository.create).not.toHaveBeenCalled();
    });
  });

  it('no consulta columnas de asistencia para tipos distintos', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada());
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).not.toHaveBeenCalled();
  });

  it('registra el log de creación', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada());
    expect(deps.logger.info).toHaveBeenCalledWith(
      '[Calificaciones] Evaluación creada',
      { asignacionId: 20, bimestre: 2, evaluacionId: 99 }
    );
  });
});
