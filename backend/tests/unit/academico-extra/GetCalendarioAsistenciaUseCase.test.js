import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { GetCalendarioAsistenciaUseCase } from '../../../src/application/use-cases/academico/asistencia/GetCalendarioAsistenciaUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

// "Hoy" simulado: 2026-03-20 (viernes). Los miércoles de marzo: 4, 11, 18, 25.
const periodoMarzo = { numero_orden: 1, nombre: 'Primer bimestre', color_hex: '#abc', fecha_inicio: '2026-03-01', fecha_fin: '2026-03-31', estado_calendario: 'abierto' };

describe('GetCalendarioAsistenciaUseCase', () => {
  const crear = ({ periodos = [periodoMarzo], periodoId = 88, estado = { registro_estado: 'CERRADO' }, teacher, acceso } = {}) => {
    const deps = {
      ...crearDepsAcceso({
        ...acceso,
        calificacionContextoRepository: {
          obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodos),
          ...acceso?.calificacionContextoRepository,
        },
        teacherRepository: teacher ?? acceso?.teacherRepository,
      }),
      cuadernoRepository: { obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(periodoId) },
      asistenciaSesionViewRepository: {
        listarBloquesHorario: jest.fn().mockResolvedValue([
          { dia: 'MIERCOLES', hora_inicio: '08:00:00', hora_fin: '09:30:00' },
        ]),
        listarDiasTomados: jest.fn().mockResolvedValue([
          { fecha: '2026-03-18', es_especial: 0, sesion_estado: 'CERRADA' },
          { fecha: '2026-03-21', es_especial: 1, motivo: 'Taller', hora_inicio: '09:00', hora_fin: '11:00', sesion_estado: 'ABIERTA' },
        ]),
        listarFeriadosCalendario: jest.fn().mockResolvedValue([
          { actividad_calendario_id: 4, nombre: 'Feriado', tipo: 'FERIADO', fecha_inicio: '2026-03-11', fecha_fin: null, es_destacada: 1 },
        ]),
        listarClasesNoDictadas: jest.fn().mockResolvedValue([{ fecha_clase: '2026-03-25', motivo: 'Docente enfermo' }]),
      },
      asistenciaPlanillaViewRepository: {
        listarCeldasPlanilla: jest.fn().mockResolvedValue([
          { fecha_clase: '2026-03-18', estado: 'AUSENTE' },
          { fecha_clase: '2026-03-18', estado: 'TARDANZA' },
          { fecha_clase: '2026-03-18', estado: null },
          { fecha_clase: '2026-03-18', estado: 'AUSENTE', tiene_licencia: 1 },
        ]),
      },
      asistenciaRegistroEstadoViewRepository: { obtenerEstadoBimestre: jest.fn().mockResolvedValue(estado) },
      logger: crearLogger(),
    };
    return { deps, useCase: new GetCalendarioAsistenciaUseCase(deps) };
  };

  beforeEach(() => jest.useFakeTimers({ now: new Date('2026-03-20T12:00:00Z') }));
  afterEach(() => jest.useRealTimers());

  it('arma curso, resumen, horario y días del bimestre', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', bimestre: '1' });

    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 1);
    expect(deps.asistenciaSesionViewRepository.listarDiasTomados).toHaveBeenCalledWith(20, '2026-03-01', '2026-03-31');
    expect(deps.asistenciaRegistroEstadoViewRepository.obtenerEstadoBimestre).toHaveBeenCalledWith(20, 88);
    expect(res.curso).toEqual({
      id: 20,
materia: 'Matemática',
materiaSigla: 'MAT',
carrera: 'Contaduría',
paralelo: 'A',
      turno: 'MAÑANA',
docente: 'Perez Rojas Ana',
estudiantes: 25,
    });
    expect(res).toMatchObject({
      bimestre: 1,
bimestreNombre: 'Primer bimestre',
bimestreColor: '#abc',
periodoAcademicoId: 88,
      anioCalendario: 2026,
gestion: 2026,
rango: { desde: '2026-03-01', hasta: '2026-03-31' },
      hoy: '2026-03-20',
registroEstado: 'CERRADO',
    });
    expect(res.resumen).toEqual({ presentes: 1, atrasados: 1, faltantes: 1, conLicencia: 1, total: 4 });
    expect(res.horario).toEqual([
      { dia: 'MIERCOLES', diaLabel: 'Miércoles', bloques: [{ inicio: '08:00', fin: '09:30' }], rango: '08:00 – 09:30' },
    ]);
    expect(res.actividadesSinClase).toEqual([
      { id: 4, nombre: 'Feriado', tipo: 'FERIADO', fechaInicio: '2026-03-11', fechaFin: '2026-03-11', estado: null, esDestacada: true },
    ]);
    expect(res.dias.map((d) => d.fechaClase)).toEqual(['2026-03-04', '2026-03-11', '2026-03-18', '2026-03-21', '2026-03-25']);
  });

  it('marca neutros, futuros, sesiones tomadas y especiales por día', async () => {
    const { useCase } = crear();
    const { dias } = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    const por = Object.fromEntries(dias.map((d) => [d.fechaClase, d]));

    expect(por['2026-03-11']).toMatchObject({ neutro: 'FERIADO', tieneAsistencia: false, esDiaClase: true });
    expect(por['2026-03-25']).toMatchObject({ neutro: 'CLASE_NO_DICTADA', motivo: 'Docente enfermo', esFuturo: true });
    expect(por['2026-03-18']).toMatchObject({ tieneAsistencia: true, tieneMarcas: true, sesionEstado: 'CERRADA', esSesionEspecial: false, esFuturo: false });
    expect(por['2026-03-21']).toMatchObject({
      esDiaClase: true, esSesionEspecial: true, motivo: 'Taller', horaInicio: '09:00', horaFin: '11:00', esFuturo: true, tieneMarcas: false,
    });
    expect(por['2026-03-04']).toMatchObject({ neutro: null, tieneAsistencia: false, sesionEstado: null });
  });

  it('sin bimestre solicitado usa el activo del calendario', async () => {
    const { useCase } = crear({ periodos: [{ ...periodoMarzo, numero_orden: 2 }] });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20 });
    expect(res.bimestre).toBe(2);
  });

  it('un bimestre solicitado fuera de 1..4 cae al activo', async () => {
    const { useCase } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 'abc' });
    expect(res.bimestre).toBe(1);
  });

  it('registroEstado es ABIERTO si no hay fila de estado, y no consulta si no hay periodo académico', async () => {
    const { useCase, deps } = crear({ periodoId: null, estado: null });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(res.registroEstado).toBe('ABIERTO');
    expect(res.periodoAcademicoId).toBeNull();
    expect(deps.asistenciaRegistroEstadoViewRepository.obtenerEstadoBimestre).not.toHaveBeenCalled();
  });

  it('tolera un fallo al leer el docente (nombre vacío)', async () => {
    const { useCase } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 7 }]), findById: jest.fn().mockRejectedValue(new Error('x')) } } });
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 });
    expect(res.curso.docente).toBe('');
  });

  it('lanza NotFoundError si no hay periodos (sin bimestre activo)', async () => {
    const { useCase } = crear({ periodos: [] });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el bimestre pedido no existe en la gestión', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 3 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.asistenciaSesionViewRepository.listarBloquesHorario).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError con asignacionId no numérico', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'abc', bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso', async () => {
    const { useCase } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) } } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, bimestre: 1 })).rejects.toBeInstanceOf(ForbiddenError);
  });
});
