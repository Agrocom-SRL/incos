import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { GetPlanillaAsistenciaSemanalUseCase } from '../../../src/application/use-cases/academico/asistencia/GetPlanillaAsistenciaSemanalUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

// "Hoy" simulado: viernes 2026-03-20. Semana lun-sáb: 2026-03-16 a 2026-03-21.
const periodoMarzo = { numero_orden: 1, fecha_inicio: '2026-03-01', fecha_fin: '2026-03-31' };

describe('GetPlanillaAsistenciaSemanalUseCase', () => {
  const crear = ({ periodos = [periodoMarzo], celdas, licencias = [], feriados = [], noDictadas = [], acceso } = {}) => {
    const deps = {
      ...crearDepsAcceso({
        ...acceso,
        calificacionContextoRepository: {
          obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodos),
        },
      }),
      cuadernoRepository: {},
      asistenciaSesionViewRepository: {
        listarBloquesHorario: jest.fn().mockResolvedValue([{ dia: 'MIERCOLES' }, { dia: 'VIERNES' }]),
        listarFeriadosCalendario: jest.fn().mockResolvedValue(feriados),
        listarClasesNoDictadas: jest.fn().mockResolvedValue(noDictadas),
      },
      asistenciaPlanillaViewRepository: {
        listarRoster: jest.fn().mockResolvedValue([
          { matricula_materia_id: 1, estudiante_id: 11, estudiante_nombre: 'Ana', estudiante_codigo: 'E1' },
          { matricula_materia_id: 2, estudiante_id: 12, estudiante_nombre: 'Beto', estudiante_codigo: 'E2' },
        ]),
        listarCeldasPlanilla: jest.fn().mockResolvedValue(
          celdas ?? [
            { matricula_materia_id: 1, fecha_clase: '2026-03-18', estado: 'AUSENTE', sesion_estado: 'ABIERTA', es_especial: 0 },
            { matricula_materia_id: 2, fecha_clase: '2026-03-18', estado: null, sesion_estado: 'ABIERTA', es_especial: 0 },
          ],
        ),
        listarLicenciasRoster: jest.fn().mockResolvedValue(licencias),
      },
      asistenciaRegistroEstadoViewRepository: {},
      logger: crearLogger(),
    };
    return { deps, useCase: new GetPlanillaAsistenciaSemanalUseCase(deps) };
  };

  beforeEach(() => jest.useFakeTimers({ now: new Date('2026-03-20T12:00:00Z') }));
  afterEach(() => jest.useRealTimers());

  it('con rango explícito arma filas por estudiante con marcas P/F', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', desde: '2026-03-16', hasta: '2026-03-21' });

    expect(deps.asistenciaPlanillaViewRepository.listarCeldasPlanilla).toHaveBeenCalledWith(20, '2026-03-16', '2026-03-21');
    expect(deps.asistenciaSesionViewRepository.listarFeriadosCalendario).toHaveBeenCalledWith(3, '2026-03-16', '2026-03-21');
    expect(res.rango).toEqual({ desde: '2026-03-16', hasta: '2026-03-21' });
    expect(res.curso).toMatchObject({ id: 20, materia: 'Matemática', paralelo: 'A' });
    expect(res.dias.map((d) => d.fechaClase)).toEqual([
      '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21',
    ]);
    expect(res.diasValidos).toEqual(['2026-03-18', '2026-03-20']);

    const [ana, beto] = res.filas;
    expect(ana).toMatchObject({ matriculaMateriaId: 1, estudianteId: 11, estudianteNombre: 'Ana', estudianteCodigo: 'E1' });
    const anaMie = ana.dias.find((d) => d.fechaClase === '2026-03-18');
    expect(anaMie).toMatchObject({ estado: 'AUSENTE', marca: 'F', neutro: null, esDiaClase: true, sesionEstado: 'ABIERTA', esFuturo: false });
    expect(beto.dias.find((d) => d.fechaClase === '2026-03-18')).toMatchObject({ estado: null, marca: 'P' });
    // Viernes: día de clase sin sesión tomada → sin marca
    expect(ana.dias.find((d) => d.fechaClase === '2026-03-20')).toMatchObject({ marca: null, estado: null, esDiaClase: true, sesionEstado: null });
    expect(res.registroEstado).toBe('ABIERTO');
  });

  it('marca puedeHabilitarEspecial solo en días sin clase ni neutro', async () => {
    const { useCase } = crear({ feriados: [{ fecha_inicio: '2026-03-17', fecha_fin: '2026-03-17' }] });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    const por = Object.fromEntries(res.dias.map((d) => [d.fechaClase, d]));
    expect(por['2026-03-16'].puedeHabilitarEspecial).toBe(true);
    expect(por['2026-03-17']).toMatchObject({ neutro: 'FERIADO', puedeHabilitarEspecial: false });
    expect(por['2026-03-18']).toMatchObject({ esDiaClase: true, tieneAsistencia: true, puedeHabilitarEspecial: false });
  });

  it('un feriado en día de clase excluye la columna de diasValidos y neutraliza la marca', async () => {
    const { useCase } = crear({ feriados: [{ fecha_inicio: '2026-03-18', fecha_fin: '2026-03-18' }] });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(res.diasValidos).toEqual(['2026-03-20']);
    expect(res.filas[0].dias.find((d) => d.fechaClase === '2026-03-18')).toMatchObject({ marca: null, neutro: 'FERIADO' });
  });

  it('clase no dictada neutraliza el día', async () => {
    const { useCase } = crear({ noDictadas: [{ fecha_clase: '2026-03-20', motivo: 'Paro' }] });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(res.dias.find((d) => d.fechaClase === '2026-03-20').neutro).toBe('CLASE_NO_DICTADA');
    expect(res.diasValidos).toEqual(['2026-03-18']);
  });

  it('licencia aprobada: marca L con sesión y neutro LICENCIA sin sesión (día de clase)', async () => {
    const { useCase } = crear({
      licencias: [{ matricula_materia_id: 1, fecha_inicio: '2026-03-18', fecha_fin: '2026-03-20' }],
    });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    const ana = res.filas[0].dias;
    expect(ana.find((d) => d.fechaClase === '2026-03-18')).toMatchObject({ marca: 'L', neutro: 'LICENCIA' });
    expect(ana.find((d) => d.fechaClase === '2026-03-20')).toMatchObject({ marca: null, neutro: 'LICENCIA' });
    // día sin clase dentro de la licencia: no genera columna por estudiante
    expect(ana.find((d) => d.fechaClase === '2026-03-19')).toBeUndefined();
    // el otro estudiante no se ve afectado
    expect(res.filas[1].dias.find((d) => d.fechaClase === '2026-03-18').marca).toBe('P');
  });

  it('registroEstado es CERRADO solo si todas las sesiones del rango están CERRADA', async () => {
    const cerradas = [
      { matricula_materia_id: 1, fecha_clase: '2026-03-18', estado: null, sesion_estado: 'CERRADA' },
      { matricula_materia_id: 1, fecha_clase: '2026-03-20', estado: null, sesion_estado: 'CERRADA' },
    ];
    const a = await crear({ celdas: cerradas }).useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(a.registroEstado).toBe('CERRADO');
    const b = await crear({ celdas: [cerradas[0], { ...cerradas[1], sesion_estado: 'ABIERTA' }] }).useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(b.registroEstado).toBe('ABIERTO');
    const c = await crear({ celdas: [] }).useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(c.registroEstado).toBe('ABIERTO');
  });

  it('una sesión especial fuera de horario cuenta como día de clase y columna válida', async () => {
    const { useCase } = crear({
      celdas: [{ matricula_materia_id: 1, fecha_clase: '2026-03-21', estado: null, sesion_estado: 'ABIERTA', es_especial: 1 }],
    });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' });
    expect(res.diasValidos).toContain('2026-03-21');
    expect(res.dias.find((d) => d.fechaClase === '2026-03-21')).toMatchObject({ esSesionEspecial: true, esDiaClase: true, esFuturo: true });
  });

  it('sin rango usa la semana vigente (lun-sáb) del bimestre activo', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20 });
    expect(res.rango).toEqual({ desde: '2026-03-16', hasta: '2026-03-21' });
    expect(deps.asistenciaPlanillaViewRepository.listarCeldasPlanilla).toHaveBeenCalledWith(20, '2026-03-16', '2026-03-21');
  });

  it('sin rango y hoy fuera del bimestre usa la primera semana del bimestre', async () => {
    const { useCase } = crear({ periodos: [{ numero_orden: 1, fecha_inicio: '2026-05-06', fecha_fin: '2026-06-30' }] });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20 });
    // 2026-05-06 es miércoles: la semana se recorta al inicio del bimestre
    expect(res.rango).toEqual({ desde: '2026-05-06', hasta: '2026-05-09' });
  });

  it('sin rango y sin periodos lanza ValidationError', async () => {
    const { useCase } = crear({ periodos: [] });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('con solo uno de los extremos del rango, deriva la semana por defecto', async () => {
    const { useCase } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-01' });
    expect(res.rango).toEqual({ desde: '2026-03-16', hasta: '2026-03-21' });
  });

  it('rechaza rango invertido', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-21', hasta: '2026-03-16' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.asistenciaPlanillaViewRepository.listarRoster).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError con asignacionId no numérico', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'abc', desde: '2026-03-16', hasta: '2026-03-21' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso', async () => {
    const { useCase, deps } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) } } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, desde: '2026-03-16', hasta: '2026-03-21' })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.asistenciaPlanillaViewRepository.listarRoster).not.toHaveBeenCalled();
  });
});
