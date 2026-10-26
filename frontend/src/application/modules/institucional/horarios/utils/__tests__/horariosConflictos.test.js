import { describe, it, expect } from 'vitest';
import {
  filterSchedulesForDocente,
  conflictHorarioIdsFromPares,
  buildMergedDocenteSchedules,
  computeConflictHorarioIds,
  resolveHorarioIdForGridCell,
  isConflictGridCell,
} from '../computeConflictosBloquesLive';
import {
  solapeParaleloHorarioKey,
  solapeParaleloHorarioKeySet,
  resolveParalelosConflictoHorarioResolucion,
  bloquesConflictoIdsFromPares,
  conflictHorarioIdsForParaleloTab,
  resolveParalelosTabsConflicto,
} from '../resolveParalelosTabsConflicto';
import {
  buildBloqueMateriaNombreMap,
  paresConflictoDeParalelo,
  paresConflictoUnicos,
  franjaConflicto,
  lineasConflictoDocente,
  horaInicioToMinutes,
  ayudaConflictoParalelo,
} from '../conflictoGuia';
import { resolveHorariosBoardBucket } from '../horariosBoardBucket';
import { buildHorariosDashboardAlertLineas } from '../buildHorariosDashboardAlertLineas';
import { indexCoberturaPorAsignacion } from '../indexCoberturaPorAsignacion';
import { normalizeArmadoTab } from '../normalizeArmadoTab';
import { resolveStepByPath, resolveStepIndex, resolveStepByKey } from '../flowStepResolvers';
import { courseSchedulesSignature } from '../courseSchedulesSignature';
import { resolveCarreraDashboardColor, buildCarreraHeadingSurfaceStyle } from '../carreraDashboardColor';
import { buildBulkAsignacionHorarioItems } from '../buildBulkAsignacionHorarioItems';

describe('computeConflictosBloquesLive', () => {
  const idx = new Map([
    ['LUNES|08:00|08:45', 1],
    ['LUNES|08:45|09:30', 2],
  ]);
  const sch = [
    { cursoId: 1, docente: ' Ana  Pérez ', bloques: [{ cursoHorarioId: 10, dia: 'lunes', horaInicio: '08:00', horaFin: '08:45' }] },
    { cursoId: 2, docente: 'ana pérez', bloques: [{ cursoHorarioId: 11, dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45' }, { dia: null }] },
    { cursoId: 3, docente: 'Otro', bloques: [{ cursoHorarioId: 12, dia: 'LUNES', horaInicio: '08:45', horaFin: '09:30' }] },
  ];
  it('filtra por docente normalizado', () => {
    expect(filterSchedulesForDocente(sch, 'ANA PÉREZ')).toHaveLength(2);
    expect(filterSchedulesForDocente(sch, '')).toEqual([]);
    expect(filterSchedulesForDocente(null, 'x')).toEqual([]);
  });
  it('extrae horarioIds de pares', () => {
    expect([...conflictHorarioIdsFromPares([{ horarioId: 3 }, { horario_id: 4 }, { horarioId: 0 }])]).toEqual([3, 4]);
    expect(conflictHorarioIdsFromPares(null).size).toBe(0);
  });
  it('detecta franjas con 2+ bloques', () => {
    expect([...computeConflictHorarioIds(sch, idx)]).toEqual([1]);
  });
  it('mezcla borradores del docente con los de los paralelos involucrados', () => {
    const merged = buildMergedDocenteSchedules(
      [
        { cursoId: 1, paraleloGestionId: 5, bloques: [{ cursoHorarioId: 1, dia: 'LUNES' }] },
        { cursoId: 2, paraleloGestionId: 6, bloques: [{ cursoHorarioId: 2 }, { cursoHorarioId: 3 }] },
        { cursoId: 3, paraleloGestionId: 7, bloques: [] },
      ],
      { 5: { draftSchedules: [{ cursoId: 1, docente: 'Ana', bloques: [{ cursoHorarioId: 3 }] }] }, 9: { draftSchedules: [] } },
      [{ paraleloGestionId: 5 }, { paraleloGestionId: 'x' }, { paraleloGestionId: 9 }],
      'Ana',
    );
    expect(merged).toHaveLength(2);
    expect(merged[1].bloques.map((b) => b.cursoHorarioId)).toEqual([2]);
  });
  it('resuelve el horarioId de una celda y si es conflicto', () => {
    expect(resolveHorarioIdForGridCell('LUNES', 480, [{ horarioId: 9 }], 45, idx)).toBe(9);
    expect(resolveHorarioIdForGridCell('LUNES', 480, [{ horaInicio: '08:00' }], 45, idx)).toBe(1);
    expect(resolveHorarioIdForGridCell('LUNES', 525, [], 45, idx)).toBe(2);
    expect(resolveHorarioIdForGridCell('LUNES', 525, [], 0, idx)).toBeNull();
    expect(isConflictGridCell('LUNES', 480, [], 45, new Set([1]), idx)).toBe(true);
    expect(isConflictGridCell('LUNES', 525, [], 45, new Set([1]), idx)).toBe(false);
    expect(isConflictGridCell('LUNES', 480, [], 45, new Set(), idx)).toBe(false);
  });
});

describe('resolveParalelosTabsConflicto', () => {
  const pares = [
    { paraleloGestionIdA: 1, paraleloGestionIdB: 2, horarioId: 10, paraleloA: 'B', paraleloB: 'A', bloqueAId: 100, bloqueBId: 101 },
    { paralelo_gestion_id_a: 3, paralelo_gestion_id_b: 3, horario_id: 11, bloque_a_id: 102 },
    { paraleloGestionIdA: 1, paraleloGestionIdB: 2, horarioId: 0 },
  ];
  it('arma claves de solape', () => {
    expect(solapeParaleloHorarioKey(1, 2)).toBe('1|2');
    expect(solapeParaleloHorarioKey(0, 2)).toBeNull();
    expect([...solapeParaleloHorarioKeySet(['1|2', { paraleloGestionId: 3, horarioId: 4 }, { paralelo_gestion_id: 0 }])]).toEqual(['1|2', '3|4']);
  });
  it('resuelve paralelos en conflicto según solapes', () => {
    const r = resolveParalelosConflictoHorarioResolucion(pares, new Set());
    expect(r.map((x) => x.paraleloNombre)).toEqual(['A', 'B', 'Paralelo #3']);
    const soloA = resolveParalelosConflictoHorarioResolucion([pares[0]], new Set(['1|10']));
    expect(soloA.map((x) => x.paraleloGestionId)).toEqual([1]);
    const soloB = resolveParalelosConflictoHorarioResolucion([pares[0]], new Set(['2|10']));
    expect(soloB.map((x) => x.paraleloGestionId)).toEqual([2]);
    const ambos = resolveParalelosConflictoHorarioResolucion([pares[0]], new Set(['1|10', '2|10']), [{ paraleloGestionId: 1, paraleloNombre: 'Meta', turno: 'T' }]);
    expect(ambos).toHaveLength(2);
    expect(ambos.find((x) => x.paraleloGestionId === 1).paraleloNombre).toBe('Meta');
  });
  it('extrae ids de bloques y horarios por pestaña', () => {
    expect([...bloquesConflictoIdsFromPares([pares[0], { bloque_a_id: 7 }])]).toEqual([100, 101, 7]);
    expect([...conflictHorarioIdsForParaleloTab(1, pares)]).toEqual([10]);
    expect([...conflictHorarioIdsForParaleloTab(3, pares)]).toEqual([11]);
    expect([...conflictHorarioIdsForParaleloTab(1, pares, new Set(['2|10']))]).toEqual([]);
    expect([...conflictHorarioIdsForParaleloTab(2, pares, new Set(['2|10']))]).toEqual([10]);
    expect(conflictHorarioIdsForParaleloTab(99, pares).size).toBe(0);
    expect(conflictHorarioIdsForParaleloTab(0, pares).size).toBe(0);
  });
  it('usa paralelosInvolucrados si vienen o los deduce de los pares', () => {
    expect(resolveParalelosTabsConflicto(null)).toEqual([]);
    const inv = [{ paraleloGestionId: 1 }];
    expect(resolveParalelosTabsConflicto({ paralelosInvolucrados: inv })).toBe(inv);
    expect(resolveParalelosTabsConflicto({ paresConflicto: [pares[0]] })).toHaveLength(2);
  });
});

describe('conflictoGuia', () => {
  const par = { paraleloGestionIdA: 1, paraleloGestionIdB: 2, bloqueAId: 10, bloqueBId: 11, horarioId: 5, dia: 'lunes', horaInicio: '08:00', horaFin: '08:45', paraleloA: 'A', paraleloB: 'B', siglaA: 'MAT', siglaB: 'FIS' };
  it('mapea bloques a materias sin pisar el primero', () => {
    const m = buildBloqueMateriaNombreMap([{ materiaNombre: 'Matemática', bloques: [{ cursoHorarioId: 10 }] }], [{ materiaSigla: 'X', bloques: [{ cursoHorarioId: 10 }, { cursoHorarioId: 11 }] }], null);
    expect(m.get(10)).toBe('Matemática');
    expect(m.get(11)).toBe('X');
  });
  it('filtra y deduplica pares', () => {
    expect(paresConflictoDeParalelo([par], 2)).toHaveLength(1);
    expect(paresConflictoDeParalelo([par], 3)).toHaveLength(0);
    expect(paresConflictoDeParalelo([par], 'x')).toEqual([]);
    expect(paresConflictoUnicos([par, { ...par, bloqueAId: 11, bloqueBId: 10 }])).toHaveLength(1);
  });
  it('describe franjas y líneas de conflicto', () => {
    expect(franjaConflicto(par)).toBe('lunes de 08:00 a 08:45');
    expect(franjaConflicto({ horaInicio: '08:00' })).toBe('08:00');
    expect(franjaConflicto(null)).toBe('');
    const nombres = new Map([[10, 'Matemática']]);
    expect(lineasConflictoDocente([par], nombres)).toEqual(['lunes de 08:00 a 08:45: Matemática (paralelo A) choca con FIS (paralelo B).']);
    expect(lineasConflictoDocente([{ bloqueAId: 1, bloqueBId: 2, horarioId: 1 }])[0]).toContain('una materia (paralelo —)');
  });
  it('convierte hora y arma ayuda por paralelo', () => {
    expect(horaInicioToMinutes('08:30')).toBe(510);
    expect(horaInicioToMinutes('9')).toBe(540);
    expect(horaInicioToMinutes('')).toBeNull();
    const a = ayudaConflictoParalelo([par], 2, new Map());
    expect(a[0]).toMatchObject({ slotKey: 'LUNES-480', miNombre: 'FIS', otroNombre: 'MAT', otroParalelo: 'A' });
    expect(ayudaConflictoParalelo([{ ...par, horaInicio: '' }], 1)).toEqual([]);
  });
});

describe('resolveHorariosBoardBucket / alertas del dashboard', () => {
  const ok = { paraleloAulaId: 1, cursosTotales: 2, cursosCreados: 2, cursosAsignados: 2 };
  it('prioriza el bucket explícito y clasifica por prioridad', () => {
    expect(resolveHorariosBoardBucket({ boardBucket: 'x' })).toBe('x');
    expect(resolveHorariosBoardBucket({ tablero_grupo: 'y' })).toBe('y');
    expect(resolveHorariosBoardBucket({ ...ok, paraleloAulaId: 0 })).toBe('sin_aulas');
    expect(resolveHorariosBoardBucket({ ...ok, bloquesSinAula: 1 })).toBe('sin_aulas');
    expect(resolveHorariosBoardBucket({ ...ok, cursosSinDocente: 1 })).toBe('sin_docentes');
    expect(resolveHorariosBoardBucket({ ...ok, conflictoDocenteHorario: true })).toBe('sin_docentes');
    expect(resolveHorariosBoardBucket({ ...ok, cursosCreados: 1 })).toBe('sin_horarios');
    expect(resolveHorariosBoardBucket({ ...ok, conflictosAula: 1 })).toBe('sin_horarios');
    expect(resolveHorariosBoardBucket(ok)).toBe('completo');
  });
  it('construye las líneas de alerta por bucket', () => {
    const lines = buildHorariosDashboardAlertLineas(
      [
        { paraleloAulaId: null, bloquesSinAula: 3 },
        { paraleloAulaId: 1, cursosSinDocente: 2, conflictoDocenteHorario: true },
        { paraleloAulaId: 1, cursosTotales: 5, cursosCreados: 3, cursosAsignados: 1, conflictosSolapeMismoBloque: 1, conflictosAula: 2 },
      ],
      { docentesConConflictos: 2 },
    );
    const txt = lines.join('\n');
    expect(txt).toMatch(/1 paralelo\(s\) sin aula base/);
    expect(txt).toMatch(/3 bloque\(s\) sin aula efectiva/);
    expect(txt).toMatch(/2 materia\(s\) sin docente/);
    expect(txt).toMatch(/choque de horario del mismo docente/);
    expect(txt).toMatch(/faltan 2 curso/);
    expect(txt).toMatch(/solapes de franja/);
    expect(txt).toMatch(/2 cruce\(s\) de ocupación de aula/);
    expect(txt).toMatch(/2 docente\(s\) con conflictos/);
  });
  it('mensajes genéricos cuando faltan detalles', () => {
    const l = buildHorariosDashboardAlertLineas([{ paraleloAulaId: 1, boardBucket: 'sin_docentes' }, { paraleloAulaId: 1, boardBucket: 'sin_horarios' }]);
    expect(l).toEqual([
      '1 paralelo(s) con pendientes de docencia.',
      '1 paralelo(s) pendientes de armado del plan semanal (cursos, franjas o validaciones de horario).',
    ]);
    expect(buildHorariosDashboardAlertLineas(null)).toEqual([]);
    const cob = buildHorariosDashboardAlertLineas([{ boardBucket: 'sin_horarios', cursosCreados: 2, cursosAsignados: 0, cursosTotales: 2 }]);
    expect(cob[0]).toMatch(/2 materia\(s\) en 1 paralelo\(s\) sin cobertura/);
    const cob2 = buildHorariosDashboardAlertLineas([{ boardBucket: 'sin_horarios', ofertasCoberturaIncompleta: 2 }]);
    expect(cob2[0]).toMatch(/2 oferta\(s\) con bloques insuficientes/);
  });
});

describe('utilidades pequeñas de horarios', () => {
  it('indexa cobertura por asignación', () => {
    const m = indexCoberturaPorAsignacion({ asignaciones: [{ asignacion_docente_id: 1, horas_requeridas: 4, bloques_asignados: 2, ok: true, asignatura: 'MAT' }, { asignacionDocenteId: 2 }, { asignacionDocenteId: 0 }] });
    expect(m.get(1)).toEqual({ horasRequeridas: 4, bloquesAsignados: 2, ok: true, asignatura: 'MAT' });
    expect(m.get(2)).toEqual({ horasRequeridas: 0, bloquesAsignados: 0, ok: false, asignatura: null });
    expect(m.size).toBe(2);
    expect(indexCoberturaPorAsignacion(null).size).toBe(0);
  });
  it('normaliza pestañas del armado', () => {
    expect(normalizeArmadoTab('gestion')).toBe('plan');
    expect(normalizeArmadoTab('cursos')).toBe('cobertura');
    expect(normalizeArmadoTab('vista')).toBe('vista');
    expect(normalizeArmadoTab('conflicto')).toBe('plan');
    expect(normalizeArmadoTab(undefined)).toBe('plan');
  });
  it('resuelve pasos del flujo', () => {
    const steps = [{ key: 'a', path: '/a' }, { key: 'b', path: '/b' }];
    expect(resolveStepByPath('/b', steps).key).toBe('b');
    expect(resolveStepByPath('/z', steps).key).toBe('a');
    expect(resolveStepIndex('b', steps)).toBe(1);
    expect(resolveStepByKey('z', steps)).toBeNull();
    expect(resolveStepByKey('a', steps).path).toBe('/a');
  });
  it('firma de horarios estable', () => {
    expect(courseSchedulesSignature(null)).toBe('0');
    expect(courseSchedulesSignature([{ cursoId: 1, bloques: [{ dia: 'L', horaInicio: '8' }] }, { cursoId: 2 }])).toBe('1[1]L:8:0;|2[0]');
  });
  it('resuelve color de carrera y estilo de encabezado', () => {
    expect(resolveCarreraDashboardColor({ carreraColorHex: 'abcdef' })).toBe('#abcdef');
    expect(resolveCarreraDashboardColor({ carreraId: 2 })).toBe('#3498DB');
    expect(resolveCarreraDashboardColor({ carreraNombre: 'Contaduría General' })).toBe('#27AE60');
    expect(resolveCarreraDashboardColor({ carreraColorHex: 'zz' })).toBeNull();
    const st = buildCarreraHeadingSurfaceStyle('#FF0000');
    expect(st.borderLeft).toBe('4px solid #FF0000');
    expect(st.borderColor).toBe('rgba(255,0,0,0.42)');
    expect(buildCarreraHeadingSurfaceStyle('nope')).toEqual({});
  });
});

describe('buildBulkAsignacionHorarioItems', () => {
  const idx = new Map([['LUNES|08:00|08:45', 1], ['LUNES|09:00|09:45', 2]]);
  const server = [{ cursoId: 1, asignacionDocenteId: 7, bloques: [
    { cursoHorarioId: 10, dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45', orden: 1 },
    { cursoHorarioId: 11, dia: 'LUNES', horaInicio: '09:00', horaFin: '09:45', orden: 2 },
  ] }];
  it('genera delete, update y create', () => {
    const draft = [{ cursoId: 1, asignacionDocenteId: 7, bloques: [
      { cursoHorarioId: 10, dia: 'LUNES', horaInicio: '09:00', horaFin: '09:45', orden: 1, aulaId: 4 },
      { cursoHorarioId: 'temp-1', dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45', orden: 3 },
    ] }];
    const { items, incomplete } = buildBulkAsignacionHorarioItems(server, draft, idx);
    expect(incomplete).toBe(false);
    expect(items).toEqual([
      { op: 'delete', id: 11 },
      { op: 'update', id: 10, asignacion_docente_id: 7, horario_id: 2, aula_id: 4, orden_secuencia: 1 },
      { op: 'create', asignacion_docente_id: 7, horario_id: 1, aula_id: null, orden_secuencia: 3 },
    ]);
  });
  it('marca incompleto si no se resuelve la franja y no emite nada para bloques sin cambios', () => {
    const draft = [{ cursoId: 1, asignacionDocenteId: 7, bloques: [
      { cursoHorarioId: 10, dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45', orden: 1 },
      { cursoHorarioId: 11, dia: 'LUNES', horaInicio: '10:00', horaFin: '10:45', orden: 2 },
      { cursoHorarioId: 'temp-2', dia: 'LUNES', horaInicio: '10:00', horaFin: '10:45' },
    ] }];
    const r = buildBulkAsignacionHorarioItems(server, draft, idx);
    expect(r.items).toEqual([]);
    expect(r.incomplete).toBe(true);
  });
});
