import { describe, it, expect, jest } from '@jest/globals';
import { GetMisCursosAsistenciaUseCase } from '../../../src/application/use-cases/academico/asistencia/GetMisCursosAsistenciaUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';
import { crearLogger } from './asistenciaTestUtils.js';

describe('GetMisCursosAsistenciaUseCase', () => {
  const fila = {
    asignacion_docente_id: '20',
    materia_nombre: 'Matemática',
    materia_sigla: 'MAT',
    carrera_nombre: 'Contaduría',
    carrera_color_hex: '#123456',
    asignatura_periodo_nombre: '1er año',
    paralelo_nombre: 'A',
    paralelo_turno: 'MAÑANA',
    cantidad_estudiantes: '25',
  };
  const crear = ({ ctx, docenteRow, filas = [fila], teachers = [{ id: 7 }] } = {}) => {
    const deps = {
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(
          ctx === undefined
            ? { gestion_id: 3, gestion_nombre: 'Gestión 2026', bimestre_vigente: '2', bimestre_nombre: 'Segundo' }
            : ctx,
        ),
      },
      calificacionCoordinacionRepository: {
        obtenerDocenteCalificaciones: jest.fn().mockResolvedValue(
          docenteRow === undefined ? { docente_id: 7, docente_nombre: 'Ana Perez' } : docenteRow,
        ),
        listarCursosPorDocente: jest.fn().mockResolvedValue(filas),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue(teachers), findById: jest.fn(), update: jest.fn() },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: crearLogger(),
    };
    return { deps, useCase: new GetMisCursosAsistenciaUseCase(deps) };
  };

  it('lista los cursos del docente de la sesión con el contrato esperado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10 });
    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 10 });
    expect(deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones).toHaveBeenCalledWith(7);
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).toHaveBeenCalledWith(7);
    expect(res).toEqual({
      docente: { id: 7, nombre: 'Ana Perez', gestionVigente: 'Gestión 2026', bimestreVigente: 2, bimestreNombre: 'Segundo' },
      cursos: [{
        id: 20,
materia: 'Matemática',
materiaSigla: 'MAT',
carrera: 'Contaduría',
carreraColor: '#123456',
        periodo: '1er año',
paralelo: 'A',
turno: 'MAÑANA',
estudiantes: 25,
      }],
    });
  });

  it('usa el docenteId recibido (coordinación) sin resolver por usuario', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ usuarioId: 10, docenteId: '9' });
    expect(deps.teacherRepository.findAll).not.toHaveBeenCalled();
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).toHaveBeenCalledWith(9);
  });

  it.each([['abc'], [0], [-3]])('rechaza docenteId inválido (%p) con NotFoundError', async (docenteId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 10, docenteId })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).not.toHaveBeenCalled();
  });

  it('aplica valores por defecto en filas incompletas', async () => {
    const { useCase } = crear({ filas: [{ asignacion_docente_id: 1 }] });
    const { cursos } = await useCase.execute({ usuarioId: 10 });
    expect(cursos[0]).toEqual({
      id: 1,
materia: '',
materiaSigla: null,
carrera: '',
carreraColor: '#64748b',
      periodo: null,
paralelo: '',
turno: '',
estudiantes: 0,
    });
  });

  it('usa gestion_anio si no hay gestion_nombre y bimestre null si no hay vigente', async () => {
    const { useCase } = crear({ ctx: { gestion_id: 3, gestion_anio: 2026 } });
    const { docente } = await useCase.execute({ usuarioId: 10 });
    expect(docente.gestionVigente).toBe('2026');
    expect(docente.bimestreVigente).toBeNull();
    expect(docente.bimestreNombre).toBeNull();
  });

  it('devuelve lista vacía si el repositorio devuelve null', async () => {
    const { useCase } = crear({ filas: null });
    await expect(useCase.execute({ usuarioId: 10 })).resolves.toMatchObject({ cursos: [] });
  });

  it('falla con 404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear({ ctx: null });
    await expect(useCase.execute({ usuarioId: 10 })).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.calificacionCoordinacionRepository.listarCursosPorDocente).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el docente no existe', async () => {
    const { useCase } = crear({ docenteRow: null });
    await expect(useCase.execute({ usuarioId: 10 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un docente', async () => {
    const { useCase } = crear({ teachers: [] });
    await expect(useCase.execute({ usuarioId: 10 })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it.each([
    ['contexto', { calificacionCoordinacionRepository: {}, teacherRepository: {}, userRepository: {}, logger: {} }],
    ['coordinación', { calificacionContextoRepository: {}, teacherRepository: {}, userRepository: {}, logger: {} }],
    ['logger', { calificacionContextoRepository: {}, calificacionCoordinacionRepository: {}, teacherRepository: {}, userRepository: {} }],
  ])('exige dependencias en el constructor (%s)', (_n, deps) => {
    expect(() => new GetMisCursosAsistenciaUseCase(deps)).toThrow(/requerido/);
  });
});
