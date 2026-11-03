import { describe, it, expect, jest } from '@jest/globals';
import { UpdateEvaluacionCuadernoUseCase } from '../../../src/application/use-cases/academico/UpdateEvaluacionCuadernoUseCase.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('UpdateEvaluacionCuadernoUseCase', () => {
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
        obtenerEvaluacionDeAsignacion: jest.fn().mockResolvedValue({
          id: 40,
          componente: 'TEORICO',
          puntos: 10,
          notas_cerradas: 0,
          periodo_academico_id: 11,
        }),
        listarEvaluaciones: jest.fn().mockResolvedValue([
          { id: 40, componente: 'TEORICO', puntos: 10 },
          { id: 41, componente: 'TEORICO', puntos: 15 },
          { id: 42, componente: 'PRACTICO', puntos: 50 },
        ]),
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn().mockResolvedValue(0),
      },
      bimesterEvaluationRepository: {
        update: jest.fn(async (id, patch) => ({ id, ...patch })),
      },
      evaluationTypeRepository: { findById: jest.fn().mockResolvedValue({ id: 6 }) },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateEvaluacionCuadernoUseCase(deps) };
  };

  const entrada = (body = {}, over = {}) => ({
    usuarioId: 1,
    asignacionId: 20,
    bimestre: 2,
    evaluacionId: 40,
    body,
    ...over,
  });

  it('actualiza nombre, tipo, fecha y devuelve el DTO', async () => {
    const { useCase, deps } = crear();
    const dto = await useCase.execute(
      entrada({ nombre: ' Parcial ', tipoEvaluacionId: 6, fecha: '2026-04-01' })
    );

    expect(deps.bimesterEvaluationRepository.update).toHaveBeenCalledWith(
      40,
      { id: 40, evaluationName: 'Parcial', evaluationTypeId: 6, date: '2026-04-01' },
      1
    );
    expect(dto).toMatchObject({ id: 40, nombre: 'Parcial', tipoEvaluacionId: 6, fecha: '2026-04-01' });
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).toHaveBeenCalledWith(40, 20);
  });

  it('sin puntos ni componente no valida cuotas', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada({ nombre: 'X' }));
    expect(deps.cuadernoRepository.listarEvaluaciones).not.toHaveBeenCalled();
    expect(deps.bimesterEvaluationRepository.update.mock.calls[0][1]).not.toHaveProperty('points');
  });

  it('fecha explícita null limpia la fecha', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada({ fecha: null }));
    expect(deps.bimesterEvaluationRepository.update.mock.calls[0][1]).toEqual({ id: 40, date: null });
  });

  it('valida puntos excluyendo la propia evaluación de la suma', async () => {
    const { useCase, deps } = crear();
    // otras teóricas = 15, cuota 30 -> 15 es el máximo
    await useCase.execute(entrada({ puntos: 15 }));
    expect(deps.bimesterEvaluationRepository.update.mock.calls[0][1]).toMatchObject({ points: 15 });
    expect(deps.cuadernoRepository.listarEvaluaciones).toHaveBeenCalledWith(20, 11);

    await expect(useCase.execute(entrada({ puntos: 16 }))).rejects.toThrow(/supera la cuota de 30/);
  });

  it('al cambiar solo el componente revalida con los puntos existentes', async () => {
    const { useCase, deps } = crear();
    // 10 puntos al práctico: 50 + 10 = 60 <= 70
    await useCase.execute(entrada({ componente: 'PRACTICO' }));
    expect(deps.bimesterEvaluationRepository.update.mock.calls[0][1]).toMatchObject({
      component: 'PRACTICO',
      points: 10,
    });
    // con 25 puntos existentes en otro práctico de 50 -> 75 > 70
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({
      id: 40, componente: 'TEORICO', puntos: 25, notas_cerradas: 0, periodo_academico_id: 11,
    });
    await expect(useCase.execute(entrada({ componente: 'PRACTICO' }))).rejects.toThrow(
      /componente práctico/
    );
  });

  it('rechaza componente inválido, nombre vacío y tipo inexistente', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ componente: 'X' }))).rejects.toThrow('Componente inválido');
    await expect(useCase.execute(entrada({ nombre: '  ' }))).rejects.toThrow('Nombre requerido');
    deps.evaluationTypeRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(entrada({ tipoEvaluacionId: 99 }))).rejects.toThrow(
      'Tipo de evaluación no encontrado'
    );
    expect(deps.bimesterEvaluationRepository.update).not.toHaveBeenCalled();
  });

  it.each([0, 1.5, 'x'])('rechaza puntos inválidos (%s)', async (puntos) => {
    const { useCase } = crear();
    await expect(useCase.execute(entrada({ puntos }))).rejects.toThrow(ValidationError);
  });

  it('lanza NotFoundError si la evaluación no pertenece a la asignación', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada({ nombre: 'X' }))).rejects.toThrow(NotFoundError);
    expect(deps.bimesterEvaluationRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso al curso', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada({ nombre: 'X' }))).rejects.toThrow(ForbiddenError);
  });

  it('bloquea bimestres que no son el vigente ni están reabiertos', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    await expect(useCase.execute(entrada({ nombre: 'X' }, { bimestre: 1 }))).rejects.toThrow(
      /está cerrado/
    );
    expect(deps.cuadernoRepository.obtenerEvaluacionDeAsignacion).not.toHaveBeenCalled();
  });

  it('permite editar un bimestre no vigente si está reabierto', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerEstadoInstitucionalBimestre.mockResolvedValue('CERRADO');
    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(2);
    await expect(useCase.execute(entrada({ nombre: 'X' }, { bimestre: 1 }))).resolves.toMatchObject({
      nombre: 'X',
    });
    expect(deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso)
      .toHaveBeenCalledWith(20, 1);
  });

  it('bloquea evaluaciones con notas cerradas salvo bimestre reabierto', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerEvaluacionDeAsignacion.mockResolvedValue({
      id: 40, componente: 'TEORICO', puntos: 10, notas_cerradas: 1, periodo_academico_id: 11,
    });
    await expect(useCase.execute(entrada({ nombre: 'X' }))).rejects.toThrow(/cerrada/);

    deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso.mockResolvedValue(1);
    await expect(useCase.execute(entrada({ nombre: 'X' }))).resolves.toMatchObject({ nombre: 'X' });
  });

  it('no opera sobre una evaluación de otro bimestre', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(12);
    await expect(useCase.execute(entrada({ nombre: 'X' }))).rejects.toThrow(/Evaluación/);
  });

  describe('asistencia', () => {
    const tipoAsistencia = { id: 9, code: 'ASISTENCIA' };

    it('al pasar a asistencia fuerza PRACTICO', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue(tipoAsistencia);
      deps.cuadernoRepository.listarColumnasAsistenciaBimestre = jest.fn().mockResolvedValue([]);
      await useCase.execute(entrada({ tipoEvaluacionId: 9 }));
      expect(deps.bimesterEvaluationRepository.update.mock.calls[0][1]).toMatchObject({ component: 'PRACTICO' });
    });

    it('rechaza una segunda columna de asistencia en el bimestre', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue(tipoAsistencia);
      deps.cuadernoRepository.listarColumnasAsistenciaBimestre = jest.fn().mockResolvedValue([{ evaluacionId: 99 }]);
      await expect(useCase.execute(entrada({ tipoEvaluacionId: 9 }))).rejects.toThrow(/Solo se permite una/);
      expect(deps.bimesterEvaluationRepository.update).not.toHaveBeenCalled();
    });

    it('rechaza cambiar una asistencia a componente teórico', async () => {
      const { useCase, deps } = crear();
      deps.evaluationTypeRepository.findById.mockResolvedValue(tipoAsistencia);
      await expect(useCase.execute(entrada({ componente: 'TEORICO' }))).rejects.toThrow(/práctico/);
    });
  });
});