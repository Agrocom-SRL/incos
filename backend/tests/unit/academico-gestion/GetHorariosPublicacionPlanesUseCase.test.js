import { describe, it, expect, jest } from '@jest/globals';
import { GetHorariosPublicacionPlanesUseCase } from '../../../src/application/use-cases/academico/GetHorariosPublicacionPlanesUseCase.js';

describe('GetHorariosPublicacionPlanesUseCase', () => {
  const crear = ({ rows = [], estados = new Map() } = {}) => {
    const deps = {
      parallelRepository: {
        obtenerPublicacionBloques: jest.fn().mockResolvedValue(rows),
        obtenerEstadoParaleloGestionPorIds: jest.fn().mockResolvedValue(estados),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    };
    return { deps, useCase: new GetHorariosPublicacionPlanesUseCase(deps) };
  };

  const fila = (o = {}) => ({
    paralelo_id: 1,
paralelo_gestion_id: 11,
paralelo_nombre: 'A',
paralelo_turno: 'MANANA',
    carrera_nombre: 'Sistemas',
periodo_nombre: 'P1',
    curso_id: 100,
materia_nombre: 'Mat',
curso_horario_id: 1000,
orden_secuencia: 1,
    dia: 'LUNES',
hora_inicio: '08:00',
hora_fin: '09:00',
    ...o,
  });

  it('sin filas devuelve planes vacíos', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ carreraId: 1 })).resolves.toEqual({ planes: [] });
    expect(deps.parallelRepository.obtenerPublicacionBloques).toHaveBeenCalledWith({ carreraId: 1 });
  });

  it('agrupa por paralelo-gestión y por curso, ordenando bloques por ordenSecuencia', async () => {
    const { useCase } = crear({
      rows: [
        fila({ curso_horario_id: 2, orden_secuencia: 2, dia: 'MARTES', aula_codigo: 'A1', aula_nombre: 'Aula 1' }),
        fila({ curso_horario_id: 1, orden_secuencia: 1, aula_codigo: 'A2' }),
        fila({ curso_id: 101, curso_horario_id: 3, horas_plan: 0 }),
      ],
    });
    const { planes } = await useCase.execute();
    expect(planes).toHaveLength(1);
    const { paralelo, schedule } = planes[0];
    expect(paralelo).toMatchObject({ id: 1, paraleloGestionId: 11, nombre: 'A', carreraNombre: 'Sistemas' });
    expect(schedule.map((c) => c.cursoId)).toEqual([100, 101]);
    expect(schedule[0].horarios.map((h) => h.id)).toEqual([1, 2]);
    expect(schedule[0].horarios[0].aula).toBe('A2');
    expect(schedule[0].horarios[1].aula).toBe('A1 — Aula 1');
    expect(schedule[1].horasSemanalesPlan).toBeNull();
  });

  it('sin paralelo_gestion_id agrupa por paralelo y deja paraleloGestionId null', async () => {
    const { useCase, deps } = crear({ rows: [fila({ paralelo_gestion_id: null })] });
    const { planes } = await useCase.execute();
    expect(planes[0].paralelo.paraleloGestionId).toBeNull();
    expect(deps.parallelRepository.obtenerEstadoParaleloGestionPorIds).toHaveBeenCalledWith([]);
    expect(planes[0].paraleloDashboard).toBeUndefined();
  });

  it('ignora filas con paralelo_id no numérico y filas sin curso válido', async () => {
    const { useCase } = crear({ rows: [fila({ paralelo_id: 'x' }), fila({ curso_id: 'y' })] });
    const { planes } = await useCase.execute();
    expect(planes).toHaveLength(1);
    expect(planes[0].schedule).toEqual([]);
  });

  it('ordena los planes por carrera, periodo, nombre y turno', async () => {
    const { useCase } = crear({
      rows: [
        fila({ paralelo_id: 1, paralelo_gestion_id: 11, carrera_nombre: 'B' }),
        fila({ paralelo_id: 2, paralelo_gestion_id: 12, carrera_nombre: 'A', paralelo_nombre: 'Z' }),
        fila({ paralelo_id: 3, paralelo_gestion_id: 13, carrera_nombre: 'A', paralelo_nombre: 'Y' }),
      ],
    });
    const { planes } = await useCase.execute();
    expect(planes.map((p) => p.paralelo.id)).toEqual([3, 2, 1]);
  });

  it('adjunta paraleloDashboard desde el estado por ids de paralelo-gestión', async () => {
    const estados = new Map([
      [11, {
        asignaturas_requeridas: '5',
cursos_creados: '4',
cursos_con_horario: '2',
ofertas_cobertura_incompleta: '1',
        cursos_sin_docente: '1',
bloques_sin_aula: '2',
conflictos_solape_mismo_bloque: 0,
conflictos_aula: 1,
        conflicto_docente_horario: 1,
paralelo_aula_id: '7',
tablero_grupo: 'sin_docentes',
      }],
    ]);
    const { useCase, deps } = crear({
      rows: [fila(), fila({ paralelo_id: 2, paralelo_gestion_id: 12 })],
      estados,
    });
    const { planes } = await useCase.execute();
    expect(deps.parallelRepository.obtenerEstadoParaleloGestionPorIds).toHaveBeenCalledWith([11, 12]);
    expect(planes[0].paraleloDashboard).toEqual({
      cursosTotales: 5,
      cursosCreados: 4,
      cursosAsignados: 2,
      cursosConHorario: 2,
      ofertasCoberturaIncompleta: 1,
      cursosSinDocente: 1,
      cursosSinBloquesHorario: 2,
      bloquesSinAula: 2,
      conflictosSolapeMismoBloque: 0,
      conflictosAula: 1,
      conflictoDocenteHorario: true,
      paraleloAulaId: 7,
      boardBucket: 'sin_docentes',
    });
    expect(planes[1].paraleloDashboard).toBeUndefined();
  });
});
