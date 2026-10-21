import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
const mockSincronizar = jest.fn();

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));
jest.unstable_mockModule('../../../src/application/utils/sincronizarNotasAsistenciaBimestre.js', () => ({
  sincronizarNotasAsistenciaBimestre: mockSincronizar,
}));

const { BulkRegistrarAsistenciaUseCase } = await import(
  '../../../src/application/use-cases/academico/asistencia/BulkRegistrarAsistenciaUseCase.js'
);

// 2026-03-18 es miércoles; "hoy" simulado = 2026-03-20.
const HOY = '2026-03-20T12:00:00Z';
const periodos = [{ numero_orden: 1, fecha_inicio: '2026-02-01', fecha_fin: '2026-04-30' }];

describe('BulkRegistrarAsistenciaUseCase', () => {
  const crear = ({ sesionExistente = null, noDictadas = [], acceso, horario = [{ dia: 'MIERCOLES' }], accion = 'creadas' } = {}) => {
    const deps = {
      ...crearDepsAcceso({
        ...acceso,
        calificacionContextoRepository: {
          obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodos),
          ...acceso?.calificacionContextoRepository,
        },
      }),
      cuadernoRepository: { obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(88) },
      sesionClaseRepository: {
        obtenerSesionPorFecha: jest.fn().mockResolvedValue(sesionExistente),
        upsertSesion: jest.fn().mockResolvedValue({ id: 501 }),
      },
      attendanceRepository: { upsertMarcaSparse: jest.fn().mockResolvedValue({ accion }) },
      asistenciaSesionViewRepository: {
        listarBloquesHorario: jest.fn().mockResolvedValue(horario),
        listarClasesNoDictadas: jest.fn().mockResolvedValue(noDictadas),
      },
      asistenciaPlanillaViewRepository: {},
      subjectEnrollmentBimesterRepository: {},
      bimesterEvaluationGradeRepository: {},
      logger: crearLogger(),
    };
    return { deps, useCase: new BulkRegistrarAsistenciaUseCase(deps) };
  };
  const dia = (o = {}) => ({ fechaClase: '2026-03-18', marcas: [{ matriculaMateriaId: 5, estado: 'ausente' }], ...o });
  const run = (useCase, body) => useCase.execute({ usuarioId: 10, asignacionId: '20', body });

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(HOY) });
    mockTransaction.mockClear();
    mockSincronizar.mockReset().mockResolvedValue({});
  });
  afterEach(() => jest.useRealTimers());

  it('guarda sesión y marcas, recalcula el bimestre y devuelve el resumen', async () => {
    const { useCase, deps } = crear();
    const res = await run(useCase, { dias: [dia({ marcas: [
      { matriculaMateriaId: '5', estado: 'ausente' },
      { matriculaMateriaId: 6, estado: 'TARDANZA' },
    ] })] });

    expect(res).toEqual({ sesionesUpsert: 1, marcas: { creadas: 2, actualizadas: 0, borradas: 0, sin_cambio: 0 } });
    expect(deps.sesionClaseRepository.upsertSesion).toHaveBeenCalledWith(
      20,
      '2026-03-18',
      { esEspecial: false, motivo: null, periodoAcademicoId: 88, horaInicio: null, horaFin: null },
      10,
      'TX',
    );
    expect(deps.attendanceRepository.upsertMarcaSparse).toHaveBeenNthCalledWith(
      1, { sesionClaseId: 501, matriculaMateriaId: 5, estado: 'AUSENTE', usuarioId: 10 }, 'TX',
    );
    expect(deps.attendanceRepository.upsertMarcaSparse).toHaveBeenNthCalledWith(
      2, { sesionClaseId: 501, matriculaMateriaId: 6, estado: 'TARDANZA', usuarioId: 10 }, 'TX',
    );
    expect(mockSincronizar).toHaveBeenCalledTimes(1);
    expect(mockSincronizar).toHaveBeenCalledWith(expect.objectContaining({ asignacionId: 20, gestionId: 3, bimestreNumero: 1, usuarioId: 10 }));
  });

  it('acumula las acciones devueltas por el repositorio (PRESENTE borra fila)', async () => {
    const { useCase } = crear({ accion: 'borradas' });
    const res = await run(useCase, { dias: [dia({ marcas: [{ matriculaMateriaId: 5, estado: 'PRESENTE' }] })] });
    expect(res.marcas.borradas).toBe(1);
  });

  it('un día sin marcas igual crea la sesión', async () => {
    const { useCase, deps } = crear();
    const res = await run(useCase, { dias: [{ fechaClase: '2026-03-18' }] });
    expect(res.sesionesUpsert).toBe(1);
    expect(deps.attendanceRepository.upsertMarcaSparse).not.toHaveBeenCalled();
  });

  it('acepta una sesión especial fuera de horario con motivo y horas', async () => {
    const { useCase, deps } = crear();
    await run(useCase, { dias: [dia({ fechaClase: '2026-03-19', esEspecial: true, motivo: 'Taller', horaInicio: '08:00', horaFin: '09:00' })] });
    expect(deps.sesionClaseRepository.upsertSesion.mock.calls[0][2]).toEqual({
      esEspecial: true, motivo: 'Taller', periodoAcademicoId: 88, horaInicio: '08:00', horaFin: '09:00',
    });
  });

  it('acepta un día fuera de horario si ya existe una sesión especial', async () => {
    const { useCase } = crear({ sesionExistente: { esEspecial: true, estado: 'ABIERTA' } });
    await expect(run(useCase, { dias: [dia({ fechaClase: '2026-03-19' })] })).resolves.toMatchObject({ sesionesUpsert: 1 });
  });

  it('no recalcula notas si la fecha no cae en ningún bimestre (periodo null)', async () => {
    const { useCase, deps } = crear({ acceso: { calificacionContextoRepository: { obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue([]) } } });
    await run(useCase, { dias: [dia()] });
    expect(deps.sesionClaseRepository.upsertSesion.mock.calls[0][2].periodoAcademicoId).toBeNull();
    expect(mockSincronizar).not.toHaveBeenCalled();
  });

  it.each([[undefined], [{}], [{ dias: [] }], [{ dias: 'x' }]])('rechaza lote sin días (%p)', async (body) => {
    const { useCase, deps } = crear();
    await expect(run(useCase, body)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['']])('rechaza fechaClase vacía (%p)', async (fechaClase) => {
    const { useCase, deps } = crear();
    await expect(run(useCase, { dias: [dia({ fechaClase })] })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.attendanceRepository.upsertMarcaSparse).not.toHaveBeenCalled();
  });

  it('rechaza fecha futura', async () => {
    const { useCase, deps } = crear();
    await expect(run(useCase, { dias: [dia({ fechaClase: '2026-03-25' })] })).rejects.toThrow(/futura/);
    expect(deps.sesionClaseRepository.upsertSesion).not.toHaveBeenCalled();
  });

  it('rechaza un día que no es de horario ni sesión especial', async () => {
    const { useCase } = crear();
    await expect(run(useCase, { dias: [dia({ fechaClase: '2026-03-19' })] })).rejects.toThrow(/no corresponde a una clase/);
  });

  it('rechaza un día registrado como clase no dictada (neutro)', async () => {
    const { useCase, deps } = crear({ noDictadas: [{ fecha_clase: '2026-03-18' }] });
    await expect(run(useCase, { dias: [dia()] })).rejects.toThrow(/no dictada/);
    expect(deps.sesionClaseRepository.upsertSesion).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError si la sesión del día está CERRADA', async () => {
    const { useCase, deps } = crear({ sesionExistente: { estado: 'CERRADA', esEspecial: false } });
    await expect(run(useCase, { dias: [dia()] })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.sesionClaseRepository.upsertSesion).not.toHaveBeenCalled();
    expect(mockSincronizar).not.toHaveBeenCalled();
  });

  it.each([[0], [-1], ['abc'], [undefined], [null], ['']])('rechaza matriculaMateriaId inválido (%p)', async (matriculaMateriaId) => {
    const { useCase, deps } = crear();
    await expect(run(useCase, { dias: [dia({ marcas: [{ matriculaMateriaId, estado: 'AUSENTE' }] })] })).rejects.toThrow(/matriculaMateriaId/);
    expect(deps.attendanceRepository.upsertMarcaSparse).not.toHaveBeenCalled();
  });

  it.each([['JUSTIFICADO'], [undefined], [null], ['']])('rechaza estado inválido (%p)', async (estado) => {
    const { useCase } = crear();
    await expect(run(useCase, { dias: [dia({ marcas: [{ matriculaMateriaId: 5, estado }] })] })).rejects.toBeInstanceOf(ValidationError);
  });

  it('propaga el error de la transacción y no recalcula', async () => {
    const { useCase, deps } = crear();
    deps.attendanceRepository.upsertMarcaSparse.mockRejectedValue(new Error('db'));
    await expect(run(useCase, { dias: [dia()] })).rejects.toThrow('db');
    expect(mockSincronizar).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError con asignacionId no numérico', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'abc', body: { dias: [dia()] } })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso al curso', async () => {
    const { useCase, deps } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) } } });
    await expect(run(useCase, { dias: [dia()] })).rejects.toBeInstanceOf(ForbiddenError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.attendanceRepository.upsertMarcaSparse).not.toHaveBeenCalled();
  });
});
