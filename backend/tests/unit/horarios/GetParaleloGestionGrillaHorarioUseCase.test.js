import { describe, it, expect, jest } from '@jest/globals';
import { GetParaleloGestionGrillaHorarioUseCase } from '../../../src/application/use-cases/horarios/GetParaleloGestionGrillaHorarioUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/index.js';

describe('GetParaleloGestionGrillaHorarioUseCase', () => {
  const crear = (over = {}) => {
    const deps = {
      parallelManagementRepository: {
        findEnrichedById: jest.fn().mockResolvedValue({ id: 11, turno: 'TARDE', estado: 'OFERTADO' }),
      },
      horarioGrillaRepository: {
        findBloquesByParaleloGestionId: jest.fn().mockResolvedValue([]),
        findCoberturaBloquesByParaleloGestionId: jest.fn().mockResolvedValue([]),
        findConflictosParaleloByParaleloGestionId: jest.fn().mockResolvedValue([]),
        findConflictosAulaByParaleloGestionId: jest.fn().mockResolvedValue([]),
        findConflictosDocenteByParaleloGestionId: jest.fn().mockResolvedValue([]),
        ...over,
      },
      scheduleRepository: { findAll: jest.fn().mockResolvedValue({ schedules: [] }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetParaleloGestionGrillaHorarioUseCase(deps) };
  };

  it.each([[0], ['x'], [undefined]])('NotFound con id inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    expect(deps.parallelManagementRepository.findEnrichedById).not.toHaveBeenCalled();
  });

  it('NotFound si el paralelo no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findEnrichedById.mockResolvedValue(null);
    await expect(useCase.execute(11)).rejects.toThrow(NotFoundError);
  });

  it('consulta todas las fuentes con el id del paralelo y arma la estructura', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute('11');

    for (const fn of Object.values(deps.horarioGrillaRepository)) {
      expect(fn).toHaveBeenCalledWith(11);
    }
    expect(out.paralelo_gestion_id).toBe(11);
    expect(out.paralelo_gestion_estado).toBe('OFERTADO');
    expect(out.turno).toBe('TARDE');
    expect(Object.keys(out.grilla)).toEqual(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']);
    expect(out.cobertura).toEqual({ completa: false, asignaciones: [] });
  });

  it('coloca los bloques en su día y marca conflicto de docente', async () => {
    const { useCase } = crear({
      findBloquesByParaleloGestionId: jest.fn().mockResolvedValue([
        { dia: 'LUNES', asignacionHorarioId: 1, asignacionDocenteId: 4, horarioId: 10, ofertaCursoId: 2 },
        { dia: 'MARTES', asignacionHorarioId: 2, asignacionDocenteId: 5, horarioId: 11, ofertaCursoId: 3 },
      ]),
      findConflictosDocenteByParaleloGestionId: jest.fn().mockResolvedValue([
        { horarioId: 10, asignacionId1: 4, asignacionId2: 9, docenteNombre: 'Ana  Pérez' },
      ]),
    });
    const out = await useCase.execute(11);

    expect(out.grilla.LUNES[0].tiene_conflicto).toBe(true);
    expect(out.grilla.MARTES[0].tiene_conflicto).toBe(false);
    expect(out.conflictos).toEqual([
      expect.objectContaining({ tipo: 'DOCENTE', mensaje: 'Ana Pérez tiene dos materias en el mismo bloque horario' }),
    ]);
  });

  it('reporta conflictos de aula y paralelo', async () => {
    const { useCase } = crear({
      findConflictosAulaByParaleloGestionId: jest.fn().mockResolvedValue([{ horarioId: 10, aulaId: 3, asignacionIds: '4,5' }]),
      findConflictosParaleloByParaleloGestionId: jest.fn().mockResolvedValue([{ horarioId: 11, asignacionIds: '6,7' }]),
    });
    const out = await useCase.execute(11);
    expect(out.conflictos.map((c) => c.tipo)).toEqual(['PARALELO', 'AULA']);
    expect(out.conflictos[1].aula_id).toBe(3);
  });

  it('cobertura completa solo si todas las asignaciones cubren sus horas', async () => {
    const mk = (rows) => crear({ findCoberturaBloquesByParaleloGestionId: jest.fn().mockResolvedValue(rows) });

    const ok = await mk([
      { asignacionDocenteId: 1, horasRequeridas: 2, bloquesAsignados: 2 },
      { asignacionDocenteId: 2, horasRequeridas: 1, bloquesAsignados: 3 },
    ]).useCase.execute(11);
    expect(ok.cobertura.completa).toBe(true);

    const falta = await mk([
      { asignacionDocenteId: 1, horasRequeridas: 2, bloquesAsignados: 1 },
    ]).useCase.execute(11);
    expect(falta.cobertura.completa).toBe(false);
    expect(falta.cobertura.asignaciones[0].ok).toBe(false);
  });

  it('carga el catálogo de franjas del turno más el sábado sin duplicados', async () => {
    const { useCase, deps } = crear();
    deps.scheduleRepository.findAll
      .mockResolvedValueOnce({ schedules: [{ id: 1, day: 'LUNES', startTime: '14:00:00', endTime: '14:45:00', shift: 'TARDE', blockNumber: 1 }] })
      .mockResolvedValueOnce({
        schedules: [
          { id: 1, day: 'LUNES', startTime: '14:00:00', endTime: '14:45:00' },
          { toPlainObject: () => ({ id: 9, day: 'SABADO', startTime: '08:00:00', endTime: '08:45:00' }) },
        ],
      });

    const out = await useCase.execute(11);

    expect(deps.scheduleRepository.findAll).toHaveBeenCalledWith(
      { shift: 'TARDE', scheduleType: 'CLASES', active: true }, { page: 1, limit: 500 }, null
    );
    expect(deps.scheduleRepository.findAll).toHaveBeenCalledWith(
      { day: 'SABADO', scheduleType: 'CLASES', active: true }, { page: 1, limit: 500 }, null
    );
    expect(out.franjas.map((f) => f.horario_id)).toEqual([1, 9]);
    expect(out.franjas[0].hora_inicio).toBe('14:00');
    expect(out.franjas[0].numero_bloque).toBe(1);
  });

  it('sin turno no consulta el catálogo de franjas', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findEnrichedById.mockResolvedValue({ id: 11 });
    const out = await useCase.execute(11);
    expect(deps.scheduleRepository.findAll).not.toHaveBeenCalled();
    expect(out.franjas).toEqual([]);
    expect(out.turno).toBeNull();
  });

  it('usa el turno maestro si el del paralelo no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findEnrichedById.mockResolvedValue({ id: 11, paraleloTurnoMaestro: 'NOCHE' });
    const out = await useCase.execute(11);
    expect(out.turno).toBe('NOCHE');
  });
});
