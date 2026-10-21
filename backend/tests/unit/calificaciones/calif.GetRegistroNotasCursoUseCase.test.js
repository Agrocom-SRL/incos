import { describe, it, expect, jest } from '@jest/globals';
import { GetRegistroNotasCursoUseCase } from '../../../src/application/use-cases/academico/GetRegistroNotasCursoUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetRegistroNotasCursoUseCase', () => {
  const filaBim = (est, bimestre, nota, extra = {}) => ({
    estudiante_id: est.id,
    codigo_estudiante: `C${est.id}`,
    cedula: `CI${est.id}`,
    nombre_completo: est.nombre,
    matricula_materia_id: 500 + est.id,
    nota_final: est.notaFinal,
    estado_materia: est.estado ?? 'CURSANDO',
    bimestre,
    nota_teorico: nota == null ? null : 10,
    nota_practico: nota == null ? null : nota - 10,
    nota_bimestre: nota,
    estado_bimestre: 'CERRADO',
    ...extra,
  });

  const crear = () => {
    const ana = { id: 1, nombre: 'Ana', notaFinal: 70 };
    const beto = { id: 2, nombre: 'Beto', notaFinal: 40 };
    const carla = { id: 3, nombre: 'Carla', notaFinal: null, estado: 'ABANDONO' };
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue({
          gestion_id: 3,
          bimestre_vigente: 2,
          bimestre_nombre: 'Segundo bimestre',
          gestion_nombre: 'Gestión 2026',
          gestion_fecha_inicio: '2026-02-01',
          gestion_fecha_fin: '2026-11-30',
        }),
        obtenerEstadoInstitucionalBimestre: jest.fn().mockResolvedValue('CERRADO'),
        obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue([
          { numero_orden: 1, nombre: 'B1', fecha_inicio: '2026-02-01', fecha_fin: '2026-04-01', estado_calendario: 'cerrado' },
          { numero_orden: 2, nombre: 'B2', fecha_inicio: '2026-04-02', fecha_fin: '2026-06-01', estado_calendario: 'abierto' },
          { numero_orden: 3, nombre: 'B3', fecha_inicio: '2026-06-02', fecha_fin: '2026-08-01', estado_calendario: 'abierto' },
        ]),
      },
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue({
          docente_id: 7,
          materia_nombre: 'Matemática',
          materia_sigla: 'MAT',
          carrera_nombre: 'Contaduría',
          carrera_color_hex: '#123456',
          asignatura_periodo_nombre: 'Primero',
          paralelo_nombre: 'A',
          paralelo_turno: 'MAÑANA',
          cantidad_estudiantes: 3,
        }),
        obtenerDocenteCalificaciones: jest.fn().mockResolvedValue({ docente_id: 7, docente_nombre: 'Prof. Pérez' }),
        listarEstudiantesRegistroNotas: jest.fn().mockResolvedValue([
          // desordenado a propósito: el use case ordena por nombre
          filaBim(carla, 1, null),
          filaBim(beto, 1, 40),
          ...[1, 2, 3, 4].map((b) => filaBim(ana, b, 70)),
        ]),
      },
      cuadernoRepository: {
        listarColumnasAsistenciaBimestre: jest.fn().mockResolvedValue([]),
      },
      subjectEnrollmentBimesterRepository: {
        contarBimestreReabiertoCurso: jest.fn(async (_a, n) => (n === 1 ? 2 : 0)),
      },
      bimesterEvaluationGradeRepository: {},
      asistenciaPlanillaViewRepository: {},
      evaluationConfigurationRepository: {
        findActiveRowByGestionId: jest.fn().mockResolvedValue({
          valor: JSON.stringify({ notaMinimaAprobacion: 60, pesosBimestres: [10, 20, 30, 40] }),
        }),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]) },
      userRepository: { findById: jest.fn() },
      authRepository: { tienePermiso: jest.fn().mockResolvedValue(false) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetRegistroNotasCursoUseCase(deps) };
  };

  const entrada = (over = {}) => ({ usuarioId: 1, asignacionId: 20, ...over });

  it('arma docente, curso, estudiantes, calendario y gestión', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(entrada());

    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).toHaveBeenCalledWith(20);
    expect(deps.evaluationConfigurationRepository.findActiveRowByGestionId).toHaveBeenCalledWith(3);
    expect(deps.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas).toHaveBeenCalledWith(20);
    expect(deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones).toHaveBeenCalledWith(7);
    expect(deps.calificacionContextoRepository.obtenerPeriodosBimestresGestion).toHaveBeenCalledWith(3);

    expect(res.docente).toEqual({
      id: 7,
      nombre: 'Prof. Pérez',
      gestionVigente: 'Gestión 2026',
      bimestreVigente: 2,
      bimestreNombre: 'Segundo bimestre',
      notaMinimaAprobacion: 60,
      pesosBimestres: [10, 20, 30, 40],
    });
    expect(res.curso).toEqual({
      id: 20,
      materia: 'Matemática',
      materiaSigla: 'MAT',
      carrera: 'Contaduría',
      carreraColor: '#123456',
      periodo: 'Primero',
      paralelo: 'A',
      turno: 'MAÑANA',
      estudiantes: 3,
    });
    expect(res.gestion).toEqual({ fechaInicio: '2026-02-01', fechaFin: '2026-11-30' });
  });

  it('ordena estudiantes por nombre, numera y rellena los 4 bimestres', async () => {
    const { useCase } = crear();
    const { estudiantes } = await useCase.execute(entrada());

    expect(estudiantes.map((e) => [e.nro, e.nombre])).toEqual([[1, 'Ana'], [2, 'Beto'], [3, 'Carla']]);
    const beto = estudiantes[1];
    expect(beto.bimestres).toHaveLength(4);
    expect(beto.bimestres[0]).toEqual({ numero: 1, teorico: 10, practico: 30, suma: 40, estado: 'CERRADO' });
    expect(beto.bimestres[3]).toEqual({ numero: 4, teorico: null, practico: null, suma: null, estado: null });
    expect(estudiantes[0]).toMatchObject({ id: 1, codigo: 'C1', cedula: 'CI1', notaFinal: 70, recuperatorio: null });
  });

  it('observación: APROBADO con gestión completa, null si incompleta, ABANDONO siempre', async () => {
    const { useCase } = crear();
    const { estudiantes } = await useCase.execute(entrada());
    expect(estudiantes[0].observacion).toBe('APROBADO'); // 70 >= 60 y 4 bimestres
    expect(estudiantes[1].observacion).toBeNull(); // gestión incompleta
    expect(estudiantes[2].observacion).toBe('ABANDONO');
  });

  it('observación REPROBADO cuando la gestión está completa y la nota final < mínima', async () => {
    const { useCase, deps } = crear();
    const filas = [1, 2, 3, 4].map((b) =>
      filaBim({ id: 9, nombre: 'Zoe', notaFinal: 45 }, b, 45)
    );
    deps.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas.mockResolvedValue(filas);
    const { estudiantes } = await useCase.execute(entrada());
    expect(estudiantes[0].observacion).toBe('REPROBADO');
  });

  it('suma teórico + práctico cuando nota_bimestre es null', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas.mockResolvedValue([
      filaBim({ id: 1, nombre: 'Ana', notaFinal: null }, 1, null, { nota_teorico: 12, nota_practico: 33 }),
    ]);
    const { estudiantes } = await useCase.execute(entrada());
    expect(estudiantes[0].bimestres[0]).toMatchObject({ teorico: 12, practico: 33, suma: 45 });
  });

  it('calendario: marca reabierto y editable según estado y bimestre vigente', async () => {
    const { useCase, deps } = crear();
    const { bimestresCalendario } = await useCase.execute(entrada());

    expect(bimestresCalendario).toHaveLength(4);
    expect(bimestresCalendario[0]).toMatchObject({ numero: 1, reabierto: true, editable: true, estadoCalendario: 'cerrado' });
    expect(bimestresCalendario[1]).toMatchObject({ numero: 2, reabierto: false, editable: true, nombre: 'B2' });
    // abierto pero posterior al vigente -> no editable
    expect(bimestresCalendario[2]).toMatchObject({ numero: 3, editable: false, estadoCalendario: 'abierto' });
    // sin periodo -> futuro, nombre null
    expect(bimestresCalendario[3]).toMatchObject({
      numero: 4, nombre: null, fechaInicio: null, fechaFin: null, estadoCalendario: 'futuro', editable: false,
    });
    expect(deps.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso).toHaveBeenCalledWith(20, 4);
  });

  it('evalúa la asistencia de cada bimestre (side-effect) sin bloquear cuando está cerrado', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(entrada());
    // estado CERRADO y sin reabrir -> no recalcula; reabierto (bimestre 1) -> sí consulta columnas
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).toHaveBeenCalledTimes(1);
    expect(deps.cuadernoRepository.listarColumnasAsistenciaBimestre).toHaveBeenCalledWith(20, 3, 1);
  });

  it('usa los valores por defecto sin política: mínima 61 y pesos 25 c/u', async () => {
    const { useCase, deps } = crear();
    deps.evaluationConfigurationRepository.findActiveRowByGestionId.mockResolvedValue(null);
    const { docente } = await useCase.execute(entrada());
    expect(docente.notaMinimaAprobacion).toBe(61);
    expect(docente.pesosBimestres).toEqual([25, 25, 25, 25]);
  });

  it('usa el año de gestión cuando no hay nombre y valores por defecto de curso/docente', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue({
      gestion_id: 3, gestion_anio: 2026,
    });
    deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones.mockResolvedValue(null);
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue({ docente_id: 7 });
    deps.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas.mockResolvedValue([]);
    const res = await useCase.execute(entrada());

    expect(res.docente).toMatchObject({ id: 7, nombre: '', gestionVigente: '2026', bimestreVigente: null });
    expect(res.curso).toMatchObject({ materia: '', carreraColor: '#64748b', estudiantes: 0 });
    expect(res.estudiantes).toEqual([]);
  });

  it.each([0, -1, 'abc', undefined])('lanza NotFoundError con asignacionId inválido (%s)', async (asignacionId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(entrada({ asignacionId }))).rejects.toThrow(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toThrow(NotFoundError);
  });

  it('lanza ForbiddenError si no es docente del curso ni coordinación', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(entrada())).rejects.toThrow(ForbiddenError);
    expect(deps.authRepository.tienePermiso)
      .toHaveBeenCalledWith(1, 'academico.calificacion.coordinacion', 'LISTAR');
    expect(deps.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas).not.toHaveBeenCalled();
  });

  it('permite a coordinación aunque no sea el docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([{ id: 99 }]);
    deps.authRepository.tienePermiso.mockResolvedValue(true);
    await expect(useCase.execute(entrada())).resolves.toMatchObject({ curso: { id: 20 } });
  });

  it('falla con 404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerContextoVigente.mockResolvedValue(null);
    await expect(useCase.execute(entrada())).rejects.toMatchObject({ statusCode: 404 });
  });
});
