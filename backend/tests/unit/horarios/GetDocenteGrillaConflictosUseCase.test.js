import { describe, it, expect, jest } from '@jest/globals';
import { GetDocenteGrillaConflictosUseCase } from '../../../src/application/use-cases/horarios/GetDocenteGrillaConflictosUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/index.js';

describe('GetDocenteGrillaConflictosUseCase', () => {
  const bundleBase = () => ({
    teacher: { docente_id: 3, nombres: 'Ana', apellido_paterno: 'Pérez' },
    scheduleRows: [
      { oferta_curso_id: 1, paralelo_turno: 'TARDE', dia: 'LUNES', hora_inicio: '14:00:00', hora_fin: '14:45:00', horario_id: 10, asignacion_horario_id: 90 },
    ],
    paresConflicto: [],
  });

  const crear = (bundle = bundleBase()) => {
    const deps = {
      teacherRepository: { findGrillaConflictosByDocenteAndGestion: jest.fn().mockResolvedValue(bundle) },
      parallelRepository: { obtenerDocentesConflictosDetalleDashboard: jest.fn().mockResolvedValue([]) },
      scheduleRepository: {
        findAll: jest.fn().mockResolvedValue({
          schedules: [{ id: 11, day: 'MARTES', startTime: '14:00:00', endTime: '14:45:00', shift: 'TARDE' }],
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetDocenteGrillaConflictosUseCase(deps) };
  };

  it.each([[0], ['x'], [undefined]])('NotFound con docenteId inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id, 1)).rejects.toThrow(NotFoundError);
    expect(deps.teacherRepository.findGrillaConflictosByDocenteAndGestion).not.toHaveBeenCalled();
  });

  it.each([[undefined], [0], ['x'], [-1]])('422 con gestion_id inválido %p', async (g) => {
    const { useCase } = crear();
    const err = await useCase.execute(3, g).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.details[0].field).toBe('gestion_id');
  });

  it('NotFound si el docente no existe', async () => {
    const { useCase } = crear({ teacher: null });
    await expect(useCase.execute(3, 1)).rejects.toThrow(NotFoundError);
  });

  it('arma la grilla con franjas del catálogo del turno y llama a repositorios', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute('3', '5');

    expect(deps.teacherRepository.findGrillaConflictosByDocenteAndGestion).toHaveBeenCalledWith(3, 5);
    expect(deps.scheduleRepository.findAll).toHaveBeenCalledTimes(1);
    expect(deps.scheduleRepository.findAll).toHaveBeenCalledWith(
      { shift: 'TARDE', scheduleType: 'CLASES', active: true },
      { page: 1, limit: 500 },
      null
    );
    const g = out.grilla_conflictos;
    expect(g.docenteId).toBe(3);
    expect(g.docenteNombre).toBe('Pérez Ana');
    expect(g.courseSchedules).toHaveLength(1);
    expect(g.franjas.map((f) => f.horario_id).sort()).toEqual([10, 11]);
  });

  it('no consulta catálogo si no hay turnos y filtra las líneas de detalle por docente', async () => {
    const { useCase, deps } = crear({ ...bundleBase(), scheduleRows: [] });
    deps.parallelRepository.obtenerDocentesConflictosDetalleDashboard.mockResolvedValue([
      { docente_id: 3, detalle_linea: ' Choque A ' },
      { docente_id: 3, detalle_linea: 'Choque A' },
      { docente_id: 99, detalle_linea: 'Ajeno' },
      { docente_id: 3, detalle_linea: '' },
    ]);

    const out = await useCase.execute(3, 1);

    expect(deps.scheduleRepository.findAll).not.toHaveBeenCalled();
    expect(out.grilla_conflictos.lineasDetalle).toEqual(['Choque A']);
  });

  it('consulta un catálogo por cada turno distinto', async () => {
    const bundle = bundleBase();
    bundle.scheduleRows.push({ oferta_curso_id: 2, paralelo_turno: 'NOCHE', horario_id: 20 });
    const { useCase, deps } = crear(bundle);
    await useCase.execute(3, 1);
    expect(deps.scheduleRepository.findAll).toHaveBeenCalledTimes(2);
  });
});
