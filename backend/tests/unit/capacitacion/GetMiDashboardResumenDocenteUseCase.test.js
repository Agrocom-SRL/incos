import { describe, it, expect, jest } from '@jest/globals';
import { GetMiDashboardResumenDocenteUseCase } from '../../../src/application/use-cases/dashboard/GetMiDashboardResumenDocenteUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetMiDashboardResumenDocenteUseCase', () => {
  const ctxBase = { gestion_id: 2, gestion_anio: 2026, gestion_nombre: 'G2026', bimestre_vigente: '2', bimestre_nombre: 'B2' };
  const crear = ({ vinculado = true, ctx = ctxBase, base = { docente: { nombre: 'Doc Base' }, cursos: [{ id: 1 }] } } = {}) => {
    const deps = {
      dashboardRepository: {
        findCargaDocenteGestion: jest.fn().mockResolvedValue({ total_asignaciones: '3', horas_semanales: '12' }),
        findHorarioBloquesDocenteGestion: jest.fn().mockResolvedValue([
          { dia: 'LUNES', hora_inicio: '18:00', hora_fin: '19:00', materia_sigla: 'MAT', materia_nombre: 'Matemática', paralelo_nombre: 'A', aula: 'A1', curso_color_hex: '#000' },
          {},
        ]),
        findActividadesDeDocente: jest.fn().mockResolvedValue([{ id: 9 }]),
        countSesionesUsuarioHoyYMes: jest.fn().mockResolvedValue({ hoy: 1, mes: 4 }),
      },
      getMisCursosAsistenciaUseCase: { execute: jest.fn().mockResolvedValue(base) },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue(vinculado ? [{ id: 6 }] : []),
        findById: jest.fn().mockResolvedValue({ lastName: 'Paz', motherLastName: 'Rojas', firstName: 'Luis' }),
        update: jest.fn(),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new GetMiDashboardResumenDocenteUseCase(deps) };
  };

  it('arma el resumen completo del docente de la sesión', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ usuarioId: 30 });
    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 30 });
    expect(deps.getMisCursosAsistenciaUseCase.execute).toHaveBeenCalledWith({ usuarioId: 30, docenteId: 6 });
    expect(deps.dashboardRepository.findCargaDocenteGestion).toHaveBeenCalledWith(6, 2026);
    expect(deps.dashboardRepository.findHorarioBloquesDocenteGestion).toHaveBeenCalledWith(6, 2);
    expect(deps.dashboardRepository.countSesionesUsuarioHoyYMes).toHaveBeenCalledWith(30);
    expect(res.docente).toEqual({ id: 6, nombre: 'Doc Base' });
    expect(res.gestion).toEqual({ anio: 2026, nombre: 'G2026', bimestre: 2, bimestreNombre: 'B2' });
    expect(res.carga).toEqual({ totalAsignaciones: 3, horasSemanales: 12 });
    expect(res.cursos).toEqual([{ id: 1 }]);
    expect(res.horarioBloques[0]).toEqual({
      dia: 'LUNES',
horaInicio: '18:00',
horaFin: '19:00',
materiaSigla: 'MAT',
materia: 'Matemática',
      paralelo: 'A',
aula: 'A1',
colorHex: '#000',
    });
    expect(res.horarioBloques[1].dia).toBeNull();
    expect(res.actividades).toEqual([{ id: 9 }]);
    expect(res.stats).toEqual({ sesionesHoy: 1, sesionesMes: 4 });
  });

  it('sin gestión vigente degrada a vacío sin consultar cursos ni horarios', async () => {
    const { deps, useCase } = crear({ ctx: null });
    const res = await useCase.execute({ usuarioId: 30 });
    expect(deps.getMisCursosAsistenciaUseCase.execute).not.toHaveBeenCalled();
    expect(deps.dashboardRepository.findCargaDocenteGestion).not.toHaveBeenCalled();
    expect(deps.dashboardRepository.findHorarioBloquesDocenteGestion).not.toHaveBeenCalled();
    expect(res.gestion).toBeNull();
    expect(res.cursos).toEqual([]);
    expect(res.horarioBloques).toEqual([]);
    expect(res.carga).toEqual({ totalAsignaciones: 0, horasSemanales: 0 });
    expect(res.docente.nombre).toBe('Paz Rojas Luis');
  });

  it('gestión sin nombre usa "Gestión <año>" y bimestre inválido -> null', async () => {
    const { useCase } = crear({ ctx: { gestion_id: 2, gestion_anio: 2025, bimestre_vigente: 'x' } });
    const res = await useCase.execute({ usuarioId: 30 });
    expect(res.gestion).toMatchObject({ anio: 2025, nombre: 'Gestión 2025', bimestre: null, bimestreNombre: null });
  });

  it('tolera un 404 del caso de uso base de mis cursos', async () => {
    const { deps, useCase } = crear();
    deps.getMisCursosAsistenciaUseCase.execute.mockRejectedValue(new NotFoundError('docente'));
    const res = await useCase.execute({ usuarioId: 30 });
    expect(res.cursos).toEqual([]);
    expect(deps.logger.warn).toHaveBeenCalled();
    expect(res.docente.nombre).toBe('Paz Rojas Luis');
  });

  it('propaga errores que no son 404', async () => {
    const { deps, useCase } = crear();
    deps.getMisCursosAsistenciaUseCase.execute.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute({ usuarioId: 30 })).rejects.toThrow('boom');
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un docente', async () => {
    const { deps, useCase } = crear({ vinculado: false });
    await expect(useCase.execute({ usuarioId: 30 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.calificacionContextoRepository.obtenerContextoVigente).not.toHaveBeenCalled();
  });

  it('exige las dependencias en el constructor', () => {
    expect(() => new GetMiDashboardResumenDocenteUseCase({})).toThrow('dashboardRepository es requerido');
    expect(() => new GetMiDashboardResumenDocenteUseCase({ dashboardRepository: {} })).toThrow(
      'getMisCursosAsistenciaUseCase'
    );
  });
});
