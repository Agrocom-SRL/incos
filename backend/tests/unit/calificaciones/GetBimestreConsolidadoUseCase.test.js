import { jest } from '@jest/globals';
import { GetBimestreConsolidadoUseCase } from '../../../src/application/use-cases/academico/GetBimestreConsolidadoUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetBimestreConsolidadoUseCase', () => {
  const periodos = [
    { numero_orden: 1, nombre: 'Primer bimestre', estado_calendario: 'cerrado', fecha_inicio: '2026-02-02', fecha_fin: '2026-04-10' },
    { numero_orden: 2, nombre: 'Segundo bimestre', estado_calendario: 'abierto' },
    { numero_orden: 3, nombre: 'Tercer bimestre', estado_calendario: 'futuro' },
  ];

  const crear = ({ bimestreVigente = 2, curso = { docente_id: 7 } } = {}) => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue(curso),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest
          .fn()
          .mockResolvedValue({ gestion_id: 3, bimestre_vigente: bimestreVigente }),
        obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodos),
      },
      cuadernoRepository: {
        obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(55),
        listarEvaluaciones: jest.fn().mockResolvedValue([
          { id: 1, tipo_evaluacion_id: 1, componente: 'TEORICO', nombre_evaluacion: 'Examen', puntos: 30 },
          { id: 2, tipo_evaluacion_id: 2, componente: 'PRACTICO', nombre_evaluacion: 'Taller', puntos: 70 },
        ]),
        listarEstudiantesResumenBimestre: jest.fn().mockResolvedValue([
          { estudiante_id: 20, codigo: 'B', nombre: 'Zoila', nota_teorico: null, nota_practico: null, nota_bimestre: null, bimestre_matricula_id: 201, estado_bimestre: 'CERRADO' },
          { estudiante_id: 10, codigo: 'A', nombre: 'Álvaro', nota_teorico: 25, nota_practico: 60, nota_bimestre: 85, bimestre_matricula_id: 101, estado_bimestre: 'CERRADO' },
        ]),
        listarTodasNotasBimestreCuaderno: jest.fn().mockResolvedValue([
          { estudiante_id: 20, evaluacion_id: 1, nota: 20 },
          { estudiante_id: 20, evaluacion_id: 2, nota: '50' },
        ]),
      },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(null),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetBimestreConsolidadoUseCase(deps) };
  };

  it('devuelve el consolidado de un bimestre cerrado, ordenado por nombre', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ usuarioId: 1, asignacionId: '10', bimestre: '1' });

    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 1);
    expect(deps.cuadernoRepository.listarEvaluaciones).toHaveBeenCalledWith(10, 55);
    expect(deps.cuadernoRepository.listarEstudiantesResumenBimestre).toHaveBeenCalledWith(10, 1);
    expect(deps.cuadernoRepository.listarTodasNotasBimestreCuaderno).toHaveBeenCalledWith(10, 1);

    expect(result).toMatchObject({
      bimestre: 1,
      cerrado: true,
      estadoCalendario: 'cerrado',
      cuotaTeorico: 30,
      cuotaPractico: 70,
    });
    expect(result.periodo.nombre).toBe('Primer bimestre');
    expect(result.evaluaciones).toEqual([
      { id: 1, nombre: 'Examen', componente: 'TEORICO', puntos: 30 },
      { id: 2, nombre: 'Taller', componente: 'PRACTICO', puntos: 70 },
    ]);
    expect(result.estudiantes.map((e) => [e.nro, e.nombre])).toEqual([
      [1, 'Álvaro'],
      [2, 'Zoila'],
    ]);
    // Álvaro: usa las notas guardadas; Zoila: las calcula desde el cuaderno.
    expect(result.estudiantes[0]).toMatchObject({ id: 10, teorico: 25, practico: 60, total: 85, bimestreMatriculaId: 101 });
    expect(result.estudiantes[1]).toMatchObject({ id: 20, teorico: 20, practico: 50, total: 70 });
  });

  it('considera cerrado un bimestre anterior al vigente aunque el calendario no lo diga', async () => {
    const { useCase } = crear({ bimestreVigente: 4 });
    const result = await useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 3 });
    expect(result.cerrado).toBe(true);
    expect(result.estadoCalendario).toBe('futuro');
  });

  it('prohíbe el consolidado de un bimestre abierto o futuro', async () => {
    const { useCase, deps } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 2 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 3 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.cuadernoRepository.listarEvaluaciones).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['x'], [undefined]])('lanza NotFound con bimestre inválido %s', async (bimestre) => {
    const { useCase, deps } = crear();
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el curso no existe', async () => {
    const { useCase } = crear({ curso: null });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza Forbidden si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear({ curso: { docente_id: 99 } });
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).not.toHaveBeenCalled();
  });

  it('lanza NotFound si no existe el periodo académico del bimestre', async () => {
    const { useCase, deps } = crear();
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(null);
    await expect(
      useCase.execute({ usuarioId: 1, asignacionId: 10, bimestre: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cuadernoRepository.listarEvaluaciones).not.toHaveBeenCalled();
  });
});
