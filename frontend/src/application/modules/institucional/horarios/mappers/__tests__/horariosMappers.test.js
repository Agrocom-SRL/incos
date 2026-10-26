import { describe, it, expect } from 'vitest';
import {
  pickAsignacionField,
  indexAsignacionesPorOferta,
  buildMatrizRows,
  horasMateriaParaAsignacion,
  proyectarCargaSemanaDocente,
  buildDocenteAsignacionCandidatos,
  mapCargaDocentesIndex,
} from '../asignacionDocenteMatrizMapper';
import { mapDocenteGrillaConflictosFromApi } from '../docenteGrillaConflictosMapper';
import {
  grillaHorarioToCourseSchedules,
  extractGrillaHorarioMeta,
  missingSubjectsFromGrillaCobertura,
  mergeGrillaWithOfertaCursos,
} from '../grillaHorarioMapper';
import { mapHorariosPublicacionPlanesPayload } from '../horariosPublicacionPlanesMapper';
import {
  mapFaltantesToMissingSubjects,
  mapOfertaCursoToFilaCurso,
  buildFilasOfertaPlantilla,
} from '../plantillaOfertaMapper';

describe('asignacionDocenteMatrizMapper', () => {
  it('pickAsignacionField acepta snake o camel', () => {
    expect(pickAsignacionField(null, 'a', 'b')).toBeNull();
    expect(pickAsignacionField({ a_b: 1 }, 'a_b', 'aB')).toBe(1);
    expect(pickAsignacionField({ aB: 2 }, 'a_b', 'aB')).toBe(2);
    expect(pickAsignacionField({}, 'a_b', 'aB')).toBeNull();
  });
  it('indexa por oferta y arma filas de matriz', () => {
    const asigs = [{ id: 9, oferta_curso_id: 1, docente_id: 4, docente_nombre: 'Ana', color_hex: '#fff', carga_horaria: 3 }, { ofertaCursoId: 0 }];
    expect(indexAsignacionesPorOferta(asigs).size).toBe(1);
    const rows = buildMatrizRows(
      [{ id: 1, materiaCodigo: 'MAT', materiaNombre: 'Mate', horasSemanales: 4 }, { id: 2 }],
      asigs,
    );
    expect(rows[0]).toMatchObject({ key: '1', materiaLabel: 'MAT — Mate', horasPlan: 4, asignacionId: 9, docenteId: 4, docenteNombre: 'Ana', cargaHoraria: 3 });
    expect(rows[1]).toMatchObject({ materiaLabel: 'OC-2', horasPlan: null, asignacionId: null, docenteNombre: null, cargaHoraria: null });
    expect(buildMatrizRows(null)).toEqual([]);
  });
  it('calcula horas de materia', () => {
    expect(horasMateriaParaAsignacion()).toBe(0);
    expect(horasMateriaParaAsignacion({ horasAsignacion: 3, horasPlan: 5 })).toBe(3);
    expect(horasMateriaParaAsignacion({ horasPlan: '4' })).toBe(4);
    expect(horasMateriaParaAsignacion({ horasPlan: -1 })).toBe(0);
    expect(horasMateriaParaAsignacion({ horasPlan: '' })).toBe(0);
  });
  it('proyecta la carga semanal del docente', () => {
    const carga = new Map([[1, { cargaSemana: 18, maxSemana: 20 }]]);
    expect(proyectarCargaSemanaDocente({ docenteId: 1, cargaPorDocente: carga, horasMateria: 4 })).toEqual({ cargaSemana: 18, projected: 22, maxSemana: 20, sobrecarga: true, disponible: 0 });
    expect(proyectarCargaSemanaDocente({ docenteId: 1, cargaPorDocente: carga, horasMateria: 4, docenteActualCursoId: 1 }).sobrecarga).toBe(false);
    expect(proyectarCargaSemanaDocente({ docenteId: 2, maxHorasSemana: 10, horasMateria: 2 })).toMatchObject({ projected: 2, maxSemana: 10, disponible: 8 });
  });
  it('arma candidatos con semáforo y limita cantidades', () => {
    const docentes = Array.from({ length: 14 }, (_, i) => ({ id: i + 1, nombreCompleto: `Doc ${i + 1}` }));
    docentes.push({ id: 100, nombreCompleto: 'Riesgo A', teachingStats: { conflictos: { hasConflictos: true } } });
    docentes.push({ id: 101, nombreCompleto: 'Riesgo B' });
    const out = buildDocenteAsignacionCandidatos({ docentes, docentesConChoque: new Set([101]) });
    expect(out.filter((d) => d.semaforo === 'verde')).toHaveLength(10);
    expect(out.find((d) => d.id === 100).semaforo).toBe('amarillo');
    expect(out.find((d) => d.id === 101).semaforo).toBe('rojo');
    const sel = buildDocenteAsignacionCandidatos({ docentes, selectedDocenteId: 14 });
    expect(sel[0].id).toBe(14);
    const q = buildDocenteAsignacionCandidatos({ docentes, candidateSearch: ' riesgo a ' });
    expect(q.map((d) => d.id)).toEqual([100]);
    expect(buildDocenteAsignacionCandidatos()).toEqual([]);
  });
  it('indexa carga de docentes', () => {
    const m = mapCargaDocentesIndex({ docentes: [{ docente_id: 1, carga_semana: '5', max_semana: 0, ratio: 0.25, nombre: 'Ana' }, { docente_id: 0 }] });
    expect(m.get(1)).toEqual({ cargaSemana: 5, maxSemana: 20, ratio: 0.25, colorHex: null, nombre: 'Ana' });
    expect(mapCargaDocentesIndex(null).size).toBe(0);
  });
});

describe('docenteGrillaConflictosMapper', () => {
  it('normaliza el payload y sus arrays', () => {
    expect(mapDocenteGrillaConflictosFromApi(null)).toBeNull();
    expect(mapDocenteGrillaConflictosFromApi('x')).toBeNull();
    const r = mapDocenteGrillaConflictosFromApi({ grilla_conflictos: { docenteId: '3', conflictHorarioIds: ['1', 'x', 2], bloquesConflictoIds: ['5'], paresConflicto: [{}] } });
    expect(r).toMatchObject({ docenteId: 3, conflictHorarioIds: [1, 2], bloquesConflictoIds: [5], courseSchedules: [], franjas: [], lineasDetalle: [] });
    expect(r.paresConflicto).toHaveLength(1);
    expect(mapDocenteGrillaConflictosFromApi({}).docenteId).toBeNull();
  });
});

describe('grillaHorarioMapper', () => {
  const payload = {
    turno: 'MANANA',
    paralelo_gestion_id: 4,
    paralelo_gestion_estado: 'BORRADOR',
    conflictos: [1],
    cobertura: { asignaciones: [{ ok: true, asignatura: 'A' }, { ok: false, asignatura: 'MAT', horas_requeridas: 4, bloques_asignados: 1 }, { ok: false }] },
    grilla: {
      MARTES: [{ oferta_curso_id: 1, asignacion_horario_id: 20, hora_inicio: '8:00:00', hora_fin: '08:45', asignatura: 'MAT', docente_id: 3, tiene_conflicto: true, aula_id: 2, aula_nombre: 'A1', horario_id: 7 }],
      LUNES: [
        { oferta_curso_id: 1, asignacion_horario_id: 21, hora_inicio: '09:00', hora_fin: '09:45', asignacion_docente_id: 6 },
        { oferta_curso_id: 0, asignacion_horario_id: 99 },
      ],
    },
  };
  it('agrupa bloques por curso, ordena y renumera', () => {
    const [c] = grillaHorarioToCourseSchedules(payload, { paraleloNombre: 'A' });
    expect(c).toMatchObject({ cursoId: 1, cursoCodigo: '—', docenteId: 3, docenteEnConflictoHorario: true });
    expect(c.bloques.map((b) => [b.dia, b.horaInicio, b.orden])).toEqual([['LUNES', '09:00', 1], ['MARTES', '08:00', 2]]);
    expect(c.bloques[1]).toMatchObject({ aula: 'A1', aulaId: 2, horarioId: 7, turno: 'MANANA', paralelo: 'A', tieneConflicto: true });
    expect(grillaHorarioToCourseSchedules(null)).toEqual([]);
  });
  it('extrae meta y materias faltantes', () => {
    expect(extractGrillaHorarioMeta(payload)).toMatchObject({ paraleloGestionId: 4, paraleloGestionEstado: 'BORRADOR', turno: 'MANANA', conflictos: [1] });
    expect(extractGrillaHorarioMeta(null)).toBeNull();
    expect(missingSubjectsFromGrillaCobertura(payload)).toEqual([
      { materiaNombre: 'MAT', materiaSigla: 'MAT', horasFaltantes: 3 },
      { materiaNombre: 'Materia', materiaSigla: null, horasFaltantes: 0 },
    ]);
    expect(missingSubjectsFromGrillaCobertura({})).toEqual([]);
  });
  it('mezcla la grilla con la oferta y las asignaciones', () => {
    const base = [{ cursoId: 1, cursoCodigo: 'MAT', materiaSigla: 'MAT', bloques: [] }];
    const asigs = new Map([[1, { asignacionId: 5, colorHex: '#111', docenteNombre: 'Ana' }], [2, { id: 6 }]]);
    const merged = mergeGrillaWithOfertaCursos(
      base,
      [{ cursoId: 1, horasSemanalesPlan: 4, materiaSigla: 'MAT2' }, { id: 2, materiaNombre: 'Física', docenteNombre: 'Beto' }, { id: 0 }],
      asigs,
    );
    expect(merged).toHaveLength(2);
    expect(merged[1]).toMatchObject({ cursoId: 1, horasSemanalesPlan: 4, cursoCodigo: 'MAT2', asignacionDocenteId: 5, cursoColorHex: '#111', docente: 'Ana' });
    expect(merged[0]).toMatchObject({ cursoId: 2, cursoCodigo: 'Física', asignacionDocenteId: 6, docente: 'Beto', horasSemanalesPlan: null });
    expect(mergeGrillaWithOfertaCursos(null, null)).toEqual([]);
  });
});

describe('horariosPublicacionPlanesMapper', () => {
  it('normaliza planes, cursos y dashboard del paralelo', () => {
    expect(mapHorariosPublicacionPlanesPayload(null)).toEqual([]);
    const [plan] = mapHorariosPublicacionPlanesPayload({
      planes: [{
        paralelo: { paralelo_gestion_id: '5', paralelo_gestion_estado: 'PUBLICADO' },
        schedule: [{ horas_plan: 3 }, { horasSemanalesPlan: 0 }, null],
        paraleloDashboard: { cursos_totales: 4, cursos_creados: 3, cursos_con_horario: 1, conflicto_docente_horario: 1, paralelo_aula_id: 8, board_bucket: 'completo' },
      }],
    });
    expect(plan.paralelo).toMatchObject({ paraleloGestionId: 5, paraleloGestionEstado: 'PUBLICADO' });
    expect(plan.schedule[0].horasSemanalesPlan).toBe(3);
    expect(plan.schedule[1].horasSemanalesPlan).toBeNull();
    expect(plan.schedule[2]).toBeNull();
    expect(plan.paraleloDashboard).toMatchObject({ cursosTotales: 4, cursosSinBloquesHorario: 2, conflictoDocenteHorario: true, paraleloAulaId: 8, boardBucket: 'completo' });
    const [vacio] = mapHorariosPublicacionPlanesPayload({ planes: [{}] });
    expect(vacio.paraleloDashboard).toBeNull();
    expect(vacio.paralelo.paraleloGestionId).toBeNull();
  });
});

describe('plantillaOfertaMapper', () => {
  it('mapea faltantes y filas de la plantilla', () => {
    expect(mapFaltantesToMissingSubjects([{ asignatura_plan_id: 1, materia_nombre: 'M', materia_codigo: 'C', horas_semanales: 2 }])).toEqual([
      { asignaturaPlanId: 1, materiaId: null, materiaNombre: 'M', materiaSigla: 'C', horasSemanalesPlan: 2 },
    ]);
    expect(mapFaltantesToMissingSubjects()).toEqual([]);
    expect(mapOfertaCursoToFilaCurso({ id: 5, materiaCodigo: 'MAT', horasSemanales: 4 })).toMatchObject({ _rowKey: 'curso-5', codigo: 'MAT · OC-5', horasSemanalesPlan: 4 });
    expect(mapOfertaCursoToFilaCurso({ id: 6 }).codigo).toBe('OC-6');
    const filas = buildFilasOfertaPlantilla([{ id: 1 }], [{ materiaId: 3, materiaNombre: 'X' }]);
    expect(filas.map((f) => f.rowKind)).toEqual(['sin_curso', 'curso']);
    expect(filas[0]._rowKey).toBe('sin-curso-3');
    expect(buildFilasOfertaPlantilla()).toEqual([]);
  });
});
