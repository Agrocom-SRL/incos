import { jest } from '@jest/globals';
import { ListCursosCalificacionesUseCase } from '../../../src/application/use-cases/academico/ListCursosCalificacionesUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListCursosCalificacionesUseCase', () => {
  const ctxBase = {
    gestion_id: 3,
    gestion_nombre: '2026',
    bimestre_vigente: 2,
    bimestre_nombre: 'Segundo bimestre',
    gestion_fecha_inicio: '2026-02-01',
    gestion_fecha_fin: '2026-12-01',
  };
  const periodos = [
    { numero_orden: 1, nombre: 'B1', estado_calendario: 'cerrado' },
    { numero_orden: 2, nombre: 'B2', estado_calendario: 'abierto' },
  ];

  const crear = ({ ctx = ctxBase, politicaRow = null } = {}) => {
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(ctx),
        obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodos),
      },
      calificacionCoordinacionRepository: {
        obtenerDocenteCalificaciones: jest
          .fn()
          .mockResolvedValue({ docente_id: 7, docente_nombre: 'Ana Pérez' }),
        listarCursosPorDocente: jest.fn().mockResolvedValue([
          {
            asignacion_docente_id: 10,
            materia_nombre: 'Redes',
            materia_sigla: 'RED',
            carrera_nombre: 'Sistemas',
            carrera_color_hex: null,
            paralelo_nombre: 'A',
            paralelo_turno: 'Noche',
            cantidad_estudiantes: 4,
            cantidad_evaluaciones_bimestre: 3,
          },
          { asignacion_docente_id: 11, cantidad_estudiantes: 0, cantidad_evaluaciones_bimestre: 0 },
        ]),
        listarResumenBimestresCursosPorDocente: jest.fn().mockResolvedValue([
          { asignacion_docente_id: 10, bimestre: 1, aprobados: 3, reprobados: 1, pendientes: 0, con_registro: 4, evaluaciones: 5 },
          { asignacion_docente_id: 10, bimestre: 2, aprobados: 0, reprobados: 0, pendientes: 4, con_registro: 2, evaluaciones: 3 },
        ]),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]), findById: jest.fn() },
      userRepository: { findById: jest.fn() },
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue(politicaRow),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListCursosCalificacionesUseCase(deps) };
  };

  it('no falla si el calendario de bimestres viene null', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerPeriodosBimestresGestion.mockResolvedValue(null);
    const result = await useCase.execute({ usuarioId: 1 });
    expect(result.bimestresCalendario).toEqual([]);
  });

  it('lista los cursos del docente de la sesión con bimestres y progreso', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ usuarioId: 1 });

    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 1 });
    expect(deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones).toHaveBeenCalledWith(7);
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).toHaveBeenCalledWith(7);
    expect(deps.calificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente)
      .toHaveBeenCalledWith(7, 61);
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(3);

    expect(result.docente).toMatchObject({
      id: 7,
      nombre: 'Ana Pérez',
      gestionVigente: '2026',
      bimestreVigente: 2,
      notaMinimaAprobacion: 61,
      periodoLectivoEnCurso: 'B2',
    });
    expect(result.gestion).toEqual({ fechaInicio: '2026-02-01', fechaFin: '2026-12-01' });
    expect(result.bimestresCalendario.map((b) => [b.numero, b.estadoCalendario]))
      .toEqual([[1, 'cerrado'], [2, 'abierto']]);

    const curso = result.cursos[0];
    expect(curso).toMatchObject({
      id: 10,
      materia: 'Redes',
      carreraColor: '#64748b',
      estudiantes: 4,
      badge: { tipo: 'en-curso', texto: 'B2 · 3 evaluaciones' },
    });
    // Cerrado: (aprobados+reprobados)/matrículas; abierto: con_registro/matrículas.
    expect(curso.bimestres[0]).toMatchObject({ numero: 1, progreso: 100, estado: { tipo: 'cerrado', etiqueta: 'Cerrado' } });
    expect(curso.bimestres[1]).toMatchObject({ numero: 2, progreso: 50, estado: { tipo: 'abierto', etiqueta: 'En curso' } });
  });

  it('marca "Sin evaluaciones" cuando el curso no tiene evaluaciones en el bimestre', async () => {
    const { useCase } = crear();
    const result = await useCase.execute({ usuarioId: 1 });
    expect(result.cursos[1].badge).toEqual({ tipo: 'sin-evaluaciones', texto: 'Sin evaluaciones' });
    expect(result.cursos[1].bimestres.every((b) => b.progreso === 0)).toBe(true);
  });

  it('usa el docente indicado (coordinación) sin resolver el de la sesión', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ usuarioId: 1, docenteId: '9' });
    expect(deps.teacherRepository.findAll).not.toHaveBeenCalled();
    expect(deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones).toHaveBeenCalledWith(9);
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).toHaveBeenCalledWith(9);
  });

  it('toma la nota mínima de aprobación de la política de la gestión', async () => {
    const { useCase, deps } = crear({ politicaRow: { valor: JSON.stringify({ notaMinimaAprobacion: 70 }) } });
    const result = await useCase.execute({ usuarioId: 1 });
    expect(result.docente.notaMinimaAprobacion).toBe(70);
    expect(deps.calificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente)
      .toHaveBeenCalledWith(7, 70);
  });

  it('lanza 404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear({ ctx: null });
    await expect(useCase.execute({ usuarioId: 1 })).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).not.toHaveBeenCalled();
  });

  it.each([[0], [-3], ['abc']])('lanza NotFound con docenteId inválido %s', async (docenteId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 1, docenteId })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFound si el docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 1, docenteId: 9 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).not.toHaveBeenCalled();
  });

  it('lanza Forbidden si el usuario de la sesión no está vinculado a un docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'ESTUDIANTE', referenceId: 3 });
    await expect(useCase.execute({ usuarioId: 1 })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('exige sus dependencias en el constructor', () => {
    const { deps } = crear();
    for (const k of ['calificacionContextoRepository', 'calificacionCoordinacionRepository', 'teacherRepository', 'userRepository', 'evaluationConfigurationRepository', 'logger']) {
      expect(() => new ListCursosCalificacionesUseCase({ ...deps, [k]: null })).toThrow();
    }
  });
});
