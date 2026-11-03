import { describe, it, expect } from 'vitest';
import {
  horaToMinutes,
  minutesToHoraStr,
  blockDurationMinutes,
  findCourseAndBlock,
  findBlockAtSlot,
  moveBlockToSlot,
  swapOrMoveBlockToSlot,
  removeBlockFromSchedules,
  appendBlockToCourse,
} from '../planSemanalBlockOps';
import {
  getTurnoGridRangeMinutes,
  getSabadoArmadoGridRangeMinutes,
  collectTurnosFromCourseSchedules,
  resolveDocenteGrillaGridRangeMinutes,
  resolveDocenteGrillaSabadoRangeMinutes,
} from '../turnoGridRange';
import {
  normalizeHoraHm,
  slotKey,
  buildHorarioSlotIndexFromGrilla,
  buildHorarioSlotIndexFromFranjas,
  resolveHorarioIdForBloque,
  buildOccupiedSlotKeysFromSchedules,
  buildFreeSlotOptionsForDay,
} from '../buildHorarioSlotIndex';
import { resolveHorasPlanSemanalCurso } from '../resolveHorasPlanSemanalCurso';
import { resumenBloquesCurso } from '../resumenBloquesCurso';
import {
  generarBloquesAutomaticosCurso,
  reajustarCoberturaCurso,
  bloquesRequeridosPorCarga,
  minutosGrillaCurso,
} from '../generarBloquesAutomaticosCurso';

const curso = (over = {}) => ({
  cursoId: 1,
  docente: 'Ana',
  asignacionDocenteId: 7,
  horasSemanalesPlan: 2,
  bloques: [],
  ...over,
});
const bloque = (id, dia, ini, fin, extra = {}) => ({ cursoHorarioId: id, dia, horaInicio: ini, horaFin: fin, ...extra });

describe('planSemanalBlockOps', () => {
  it('convierte horas a minutos y viceversa', () => {
    expect(horaToMinutes('08:30')).toBe(510);
    expect(horaToMinutes('08:30:15')).toBe(510);
    expect(horaToMinutes(new Date(2026, 0, 1, 9, 5))).toBe(545);
    expect(horaToMinutes('xx')).toBeNull();
    expect(horaToMinutes('')).toBeNull();
    expect(horaToMinutes(5)).toBeNull();
    expect(minutesToHoraStr(545)).toBe('09:05');
  });
  it('blockDurationMinutes cae a 45 si el rango es inválido', () => {
    expect(blockDurationMinutes('08:00', '09:30')).toBe(90);
    expect(blockDurationMinutes('09:00', '08:00')).toBe(45);
    expect(blockDurationMinutes(null, '08:00')).toBe(45);
  });
  it('encuentra curso/bloque y bloque en franja', () => {
    const sch = [curso({ bloques: [bloque('a', 'LUNES', '08:00', '08:45')] })];
    expect(findCourseAndBlock(sch, 1, 'a').block.cursoHorarioId).toBe('a');
    expect(findCourseAndBlock(null, 1, 'a')).toEqual({ course: undefined, block: undefined });
    expect(findBlockAtSlot(sch, 'lunes', 480).block.cursoHorarioId).toBe('a');
    expect(findBlockAtSlot(sch, 'lunes', 480, 'a').block).toBeNull();
    expect(findBlockAtSlot(sch, '', NaN)).toEqual({ course: null, block: null });
  });
  it('mueve un bloque conservando la duración y limpiando horarioId', () => {
    const sch = [curso({ bloques: [bloque('a', 'LUNES', '08:00', '09:30', { horarioId: 4 })] })];
    const out = moveBlockToSlot(sch, { cursoId: 1, cursoHorarioId: 'a', targetDia: 'MARTES', targetSlotMinutes: 600 });
    expect(out[0].bloques[0]).toMatchObject({ dia: 'MARTES', horaInicio: '10:00', horaFin: '11:30', horarioId: null });
    expect(sch[0].bloques[0].dia).toBe('LUNES');
  });
  it('intercambia bloques de cursos distintos y mueve si el destino está libre', () => {
    const sch = [
      curso({ cursoId: 1, bloques: [bloque('a', 'LUNES', '08:00', '08:45')] }),
      curso({ cursoId: 2, bloques: [bloque('b', 'MARTES', '09:00', '09:45')] }),
    ];
    const swapped = swapOrMoveBlockToSlot(sch, {
      cursoId: 1, cursoHorarioId: 'a', targetDia: 'MARTES', targetSlotMinutes: 540, sourceDia: 'LUNES', sourceSlotMinutes: 480,
    });
    expect(swapped[0].bloques[0]).toMatchObject({ dia: 'MARTES', horaInicio: '09:00' });
    expect(swapped[1].bloques[0]).toMatchObject({ dia: 'LUNES', horaInicio: '08:00' });
    const moved = swapOrMoveBlockToSlot(sch, {
      cursoId: 1, cursoHorarioId: 'a', targetDia: 'JUEVES', targetSlotMinutes: 600, sourceDia: 'LUNES', sourceSlotMinutes: 480,
    });
    expect(moved[0].bloques[0].dia).toBe('JUEVES');
    expect(moved[1].bloques[0].dia).toBe('MARTES');
  });
  it('quita y agrega bloques con orden incremental', () => {
    const sch = [curso({ bloques: [bloque('a', 'LUNES', '08:00', '08:45', { orden: 3 })] })];
    const added = appendBlockToCourse(sch, 1, bloque('b', 'LUNES', '09:00', '09:45'));
    expect(added[0].bloques[1].orden).toBe(4);
    expect(removeBlockFromSchedules(added, 1, 'a')[0].bloques).toHaveLength(1);
    expect(appendBlockToCourse([curso({ bloques: undefined })], 1, bloque('c'))[0].bloques[0].orden).toBe(1);
  });
});

describe('turnoGridRange', () => {
  it('resuelve rangos por turno (con tildes y mayúsculas)', () => {
    expect(getTurnoGridRangeMinutes('Noche')).toEqual({ start: 1095, end: 1320 });
    expect(getTurnoGridRangeMinutes('tarde').start).toBe(825);
    expect(getTurnoGridRangeMinutes('Mañana')).toEqual({ start: 450, end: 840 });
    expect(getTurnoGridRangeMinutes(null)).toEqual({ start: 480, end: 1320 });
  });
  it('colecciona turnos y resuelve la grilla del docente', () => {
    const sch = [
      { turno: 'Mañana', bloques: [{ turno: 'NOCHE' }] },
      { turno: '', bloques: [{}] },
    ];
    expect(collectTurnosFromCourseSchedules(sch).sort()).toEqual(['MANANA', 'NOCHE']);
    expect(resolveDocenteGrillaGridRangeMinutes(sch)).toEqual({ start: 450, end: 1320 });
    expect(resolveDocenteGrillaGridRangeMinutes([], 'tarde')).toEqual(getTurnoGridRangeMinutes('tarde'));
    expect(resolveDocenteGrillaGridRangeMinutes([])).toEqual(getTurnoGridRangeMinutes(null));
    expect(resolveDocenteGrillaGridRangeMinutes([{ turno: 'noche' }])).toEqual(getTurnoGridRangeMinutes('noche'));
  });
  it('amplía el sábado si hay turno noche', () => {
    expect(resolveDocenteGrillaSabadoRangeMinutes([{ turno: 'NOCHE' }]).end).toBe(1320);
    expect(resolveDocenteGrillaSabadoRangeMinutes([]).end).toBe(getSabadoArmadoGridRangeMinutes().end);
  });
});

describe('buildHorarioSlotIndex', () => {
  it('normaliza horas y claves de franja', () => {
    expect(normalizeHoraHm('8:05:00')).toBe('08:05');
    expect(normalizeHoraHm('xx')).toBeNull();
    expect(normalizeHoraHm('')).toBeNull();
    expect(slotKey('lunes', '8:00', '08:45')).toBe('LUNES|08:00|08:45');
    expect(slotKey(null, '08:00', '08:45')).toBeNull();
  });
  it('indexa desde grilla y franjas ignorando ids inválidos', () => {
    const idx = buildHorarioSlotIndexFromGrilla({
      grilla: { LUNES: [{ hora_inicio: '08:00', hora_fin: '08:45', horario_id: 3 }, { hora_inicio: '09:00', hora_fin: '09:45', horario_id: 0 }] },
      franjas: [{ dia: 'MARTES', hora_inicio: '08:00', hora_fin: '08:45', horario_id: 9 }],
    });
    expect(idx.get('LUNES|08:00|08:45')).toBe(3);
    expect(idx.size).toBe(2);
    expect(buildHorarioSlotIndexFromGrilla(null).size).toBe(0);
    expect(buildHorarioSlotIndexFromFranjas([{ dia: 'LUNES', hora_inicio: '08:00', hora_fin: '08:45', horario_id: 1 }]).size).toBe(1);
    expect(buildHorarioSlotIndexFromFranjas().size).toBe(0);
  });
  it('resuelve el horarioId del bloque por franja o por el propio bloque', () => {
    const idx = new Map([['LUNES|08:00|08:45', 3]]);
    expect(resolveHorarioIdForBloque({ dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45' }, idx)).toBe(3);
    expect(resolveHorarioIdForBloque({ dia: 'LUNES', horaInicio: '10:00', horaFin: '10:45', horarioId: 8 }, idx)).toBe(8);
    expect(resolveHorarioIdForBloque({}, idx)).toBeNull();
  });
  it('arma franjas ocupadas y opciones libres', () => {
    const occ = buildOccupiedSlotKeysFromSchedules([curso({ bloques: [bloque('a', 'LUNES', '08:00', '08:45')] })]);
    expect(occ.has('LUNES|08:00|08:45')).toBe(true);
    const opts = buildFreeSlotOptionsForDay({ dia: 'LUNES', rangeStart: 480, rangeEnd: 570, occupiedKeys: occ });
    expect(opts).toEqual([{ value: 525, label: '08:45–09:30' }]);
    const sab = buildFreeSlotOptionsForDay({ dia: 'SABADO', rangeStart: 0, rangeEnd: 0, occupiedKeys: null, sabadoFixedStarts: [900] });
    expect(sab).toEqual([{ value: 900, label: '15:00–15:45' }]);
  });
});

describe('resolveHorasPlanSemanalCurso / resumenBloquesCurso', () => {
  it('prioriza la carga del curso sobre la cobertura', () => {
    expect(resolveHorasPlanSemanalCurso({ horasSemanalesPlan: 3 }, { horasRequeridas: 5 })).toBe(3);
    expect(resolveHorasPlanSemanalCurso({}, { horasRequeridas: 5 })).toBe(5);
    expect(resolveHorasPlanSemanalCurso(null)).toBeNull();
  });
  it('resume horas, días y líneas ordenadas', () => {
    const r = resumenBloquesCurso({
      horasSemanalesPlan: '4',
      bloques: [
        bloque('a', 'MARTES', '10:00', '11:00'),
        bloque('b', 'LUNES', '09:00', '09:45'),
        bloque('c', 'LUNES', '08:00', '08:45'),
        bloque('d', null, '08:00', '08:45'),
      ],
    });
    expect(r.horasPlan).toBe(4);
    expect(r.horasGrilla).toBe(3.25);
    expect(r.diasOrd).toEqual(['Martes', 'Lunes']);
    expect(r.lineas).toEqual(['Lunes: 08:00–08:45, 09:00–09:45', 'Martes: 10:00–11:00']);
    expect(resumenBloquesCurso({}).horasPlan).toBeNull();
  });
});

describe('generarBloquesAutomaticosCurso', () => {
  it('calcula bloques requeridos y minutos', () => {
    expect(bloquesRequeridosPorCarga(2.4)).toBe(2);
    expect(bloquesRequeridosPorCarga(0)).toBe(0);
    expect(bloquesRequeridosPorCarga('x')).toBe(0);
    expect(minutosGrillaCurso(curso({ bloques: [bloque('a', 'LUNES', '08:00', '09:00'), bloque('b', 'LUNES', '09:00', '09:00')] }))).toBe(105);
  });
  it('rechaza casos sin curso, sin docente, sin carga o ya cubierto', () => {
    const base = [curso()];
    expect(generarBloquesAutomaticosCurso({ schedules: base, cursoId: 99 }).message).toMatch(/no encontrada/);
    expect(generarBloquesAutomaticosCurso({ schedules: [curso({ docente: null })], cursoId: 1 }).message).toMatch(/docente/);
    expect(generarBloquesAutomaticosCurso({ schedules: [curso({ horasSemanalesPlan: 0 })], cursoId: 1 }).message).toMatch(/carga horaria definida/);
    const cubierto = [curso({ bloques: [bloque('a', 'LUNES', '08:00', '08:45'), bloque('b', 'LUNES', '09:00', '09:45')] })];
    expect(generarBloquesAutomaticosCurso({ schedules: cubierto, cursoId: 1 }).message).toMatch(/ya está cubierta/);
  });
  it('coloca los bloques faltantes en franjas libres con aula y horarioId', () => {
    const idx = new Map([['LUNES|08:00|08:45', 55]]);
    const r = generarBloquesAutomaticosCurso({
      schedules: [curso()],
      cursoId: 1,
      turnoLabel: 'Mañana',
      horarioSlotIndex: idx,
      aulaMeta: { aulaId: '3', aulaCodigo: 'A1', aulaNombre: 'Aula', paraleloNombre: 'A' },
    });
    expect(r.placed).toBe(2);
    expect(r.faltante).toBe(0);
    expect(r.message).toBeNull();
    const [b1, b2] = r.schedules[0].bloques;
    expect(b1).toMatchObject({ dia: 'LUNES', horaInicio: '07:30', aula: 'A1 · Aula', aulaId: 3, paralelo: 'A', turno: 'Mañana' });
    expect(b1.asignacionDocenteId).toBe(7);
    expect(b2.orden).toBe(2);
  });
  it('usa horasPlanOverride y respeta franjas ocupadas por otros cursos', () => {
    const otro = curso({ cursoId: 2, bloques: [bloque('x', 'LUNES', '07:30', '08:15')] });
    const r = generarBloquesAutomaticosCurso({ schedules: [curso({ horasSemanalesPlan: 0 }), otro], cursoId: 1, turnoLabel: 'Mañana', horasPlanOverride: 1 });
    expect(r.placed).toBe(1);
    expect(r.schedules[0].bloques[0].horaInicio).not.toBe('07:30');
  });
  it('reporta faltante cuando no hay franjas libres', () => {
    const r = generarBloquesAutomaticosCurso({ schedules: [curso()], cursoId: 1, horasPlanOverride: 1000 });
    expect(r.placed).toBeGreaterThan(0);
    expect(r.faltante).toBeGreaterThan(0);
    expect(r.message).toMatch(/faltan/);
  });
});

describe('reajustarCoberturaCurso', () => {
  it('valida precondiciones', () => {
    expect(reajustarCoberturaCurso({ schedules: [], cursoId: 1 }).message).toMatch(/no encontrada/);
    expect(reajustarCoberturaCurso({ schedules: [curso({ asignacionDocenteId: null })], cursoId: 1 }).message).toMatch(/docente/);
    expect(reajustarCoberturaCurso({ schedules: [curso({ horasSemanalesPlan: 0 })], cursoId: 1 }).message).toMatch(/carga horaria/);
  });
  it('quita los bloques en exceso (los de mayor orden)', () => {
    const c = curso({
      horasSemanalesPlan: 1,
      bloques: [bloque('a', 'LUNES', '08:00', '08:45', { orden: 1 }), bloque('b', 'MARTES', '08:00', '08:45', { orden: 2 })],
    });
    const r = reajustarCoberturaCurso({ schedules: [c], cursoId: 1 });
    expect(r.removed).toBe(1);
    expect(r.schedules[0].bloques.map((b) => b.cursoHorarioId)).toEqual(['a']);
    expect(r.message).toMatch(/quitaron 1/);
  });
  it('genera los faltantes si no hay exceso', () => {
    const r = reajustarCoberturaCurso({ schedules: [curso()], cursoId: 1, turnoLabel: 'Noche' });
    expect(r.removed).toBe(0);
    expect(r.placed).toBe(2);
  });
});
