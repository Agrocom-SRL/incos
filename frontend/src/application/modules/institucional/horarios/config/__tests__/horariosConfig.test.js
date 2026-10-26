import { describe, it, expect, vi } from 'vitest';
import {
  HORARIOS_GESTION_PATH,
  HORARIOS_CONFLICTOS_PATH,
  buildOfertaParaleloDetalleFromHorarios,
  buildHorariosArmadoUrl,
  docenteConflictoTiposSet,
  docenteTieneConflictoHorario,
  docenteSoloConflictoAula,
  docenteSoloConflictoDuplicado,
  hintModalConflictoDocente,
  buildResolverConflictoDocenteNavTarget,
  buildHorariosConflictosUrl,
  labelResolverConflictoDocente,
  paraleloSinDocentesEsSoloChoqueHorario,
  findDocenteConflictoHorarioEnParalelo,
  buildParaleloSinDocentesNavTarget,
  labelParaleloSinDocentesCta,
  permisoParaleloSinDocentesCta,
  formatHorariosNavTarget,
} from '../paths';
import {
  canListarAsignacion,
  canEditarAsignacion,
  canEliminarAsignacion,
  canGestionarColor,
  canVerCarga,
  PERM_ASIGNACION_DOCENTE,
  PERM_ASIGNACION_LEGACY,
} from '../asignacionDocentePermisos';
import { STATUS_ORDER, BOARD_COLUMNS } from '../dashboardConstants';
import { isParaleloGestionHorarioEditable, isParaleloGestionPlanSemanalEditable, isParaleloGestionCoberturaReajustable, mensajeParaleloGestionCoberturaNoReajustable, mensajeParaleloGestionNoEditable, mensajeParaleloGestionPlanNoEditable } from '../../utils/paraleloGestionHorarioEditable';
import { unwrapParaleloSchedulePayload, extractParaleloScheduleMeta, paraleloScheduleToCourseSchedules } from '../../utils/paraleloScheduleToCourseSchedules';
import { resumenTableroParaleloCard } from '../../utils/paraleloTableroResumen';
import { detectarConflictos } from '../../utils/paralelos.estado.utils';
import { resolveSinHorariosCta } from '../../utils/resolveSinHorariosCta';
import { summarizeBulkAsignacionHorarios } from '../../utils/summarizeBulkAsignacionHorarios';
import { syncArmadoSearchParams, armadoSearchParamsEqual } from '../../utils/syncArmadoSearchParams';
import { buildCarreraImageUrl } from '../../utils/buildCarreraImageUrl';
import { HORARIOS_STEPS } from '../../utils/horarios.steps';

describe('paths de horarios', () => {
  it('arma URLs de armado y conflictos', () => {
    expect(buildHorariosArmadoUrl(3)).toBe('/institucional/horarios/armado?pg=3&tab=plan');
    expect(buildHorariosArmadoUrl(3, { tab: 'cursos' })).toBe('/institucional/horarios/armado?pg=3&tab=cobertura');
    expect(buildHorariosArmadoUrl('x')).toBe('/institucional/horarios/armado');
    expect(buildHorariosConflictosUrl(2, { vista: 7 })).toBe(`${HORARIOS_CONFLICTOS_PATH}?docenteId=2&vista=pg-7`);
    expect(buildHorariosConflictosUrl(2, { vista: 'docente' })).toBe(`${HORARIOS_CONFLICTOS_PATH}?docenteId=2`);
    expect(buildHorariosConflictosUrl()).toBe(HORARIOS_CONFLICTOS_PATH);
  });
  it('arma el destino al detalle de paralelo con state de retorno', () => {
    const t = buildOfertaParaleloDetalleFromHorarios(4, { ofertaCursoId: 9 });
    expect(t.pathname).toContain('4');
    expect(t.state).toMatchObject({ returnListPath: HORARIOS_GESTION_PATH, ofertaCursoId: 9 });
    expect(buildOfertaParaleloDetalleFromHorarios(4).state.ofertaCursoId).toBeUndefined();
  });
  it('clasifica tipos de conflicto del docente', () => {
    expect([...docenteConflictoTiposSet({ tiposConflicto: [' Horario ', null] })]).toEqual(['horario']);
    expect(docenteTieneConflictoHorario({ tiposConflicto: ['horario'] })).toBe(true);
    expect(docenteSoloConflictoAula({ tiposConflicto: ['aula'] })).toBe(true);
    expect(docenteSoloConflictoDuplicado({ tiposConflicto: ['duplicado'] })).toBe(true);
    expect(docenteTieneConflictoHorario()).toBe(false);
  });
  it('elige hint, etiqueta y destino para resolver conflictos', () => {
    const aula = { tiposConflicto: ['aula'], docenteId: 3 };
    const dup = { tiposConflicto: ['duplicado'], paraleloGestionId: 5, ofertaCursoId: 8 };
    const hor = { tiposConflicto: ['horario'], docenteId: 3 };
    expect(hintModalConflictoDocente(aula)).toMatch(/misma aula/);
    expect(hintModalConflictoDocente(dup)).toMatch(/más de una asignación/);
    expect(hintModalConflictoDocente(hor)).toMatch(/Mueva al menos/);
    expect(labelResolverConflictoDocente(aula)).toBe('Resolver en aulas');
    expect(labelResolverConflictoDocente(dup)).toBe('Revisar asignación');
    expect(labelResolverConflictoDocente(hor)).toBe('Resolver conflictos');
    expect(buildResolverConflictoDocenteNavTarget(hor).search).toBe('?docenteId=3');
    expect(buildResolverConflictoDocenteNavTarget(dup).state.ofertaCursoId).toBe(8);
    expect(buildResolverConflictoDocenteNavTarget(aula).search).toBe('?docenteId=3');
    expect(buildResolverConflictoDocenteNavTarget({ tiposConflicto: ['aula'] }).search).toBeUndefined();
    expect(buildResolverConflictoDocenteNavTarget({ docenteId: 3 }).search).toBe('?docenteId=3');
    expect(buildResolverConflictoDocenteNavTarget({ paraleloGestionId: 2 }).pathname).toContain('pg=2');
    expect(buildResolverConflictoDocenteNavTarget()).toEqual({ pathname: HORARIOS_GESTION_PATH });
  });
  it('resuelve la CTA de paralelos sin docentes', () => {
    const soloChoque = { paraleloGestionId: 5, paralelo: 'a', turno: 'noche', conflictoDocenteHorario: true };
    expect(paraleloSinDocentesEsSoloChoqueHorario(soloChoque)).toBe(true);
    expect(paraleloSinDocentesEsSoloChoqueHorario({ cursosSinDocente: 1, conflictoDocenteHorario: true })).toBe(false);
    const docentes = [{ docenteId: 9, tiposConflicto: ['horario'], lineasDetalle: ['Paralelo A NOCHE: ...'] }, { docenteId: 10, tiposConflicto: ['aula'] }];
    expect(findDocenteConflictoHorarioEnParalelo(5, { paralelo: 'a', turno: 'noche' }, docentes).docenteId).toBe(9);
    expect(findDocenteConflictoHorarioEnParalelo(5, { paralelo: 'a', turno: 'tarde' }, docentes)).toBeNull();
    expect(findDocenteConflictoHorarioEnParalelo(5, {}, [])).toBeNull();
    expect(buildParaleloSinDocentesNavTarget(soloChoque, docentes).search).toBe('?docenteId=9');
    expect(buildParaleloSinDocentesNavTarget(soloChoque, []).pathname).toBe(HORARIOS_CONFLICTOS_PATH);
    expect(buildParaleloSinDocentesNavTarget({ paraleloGestionId: 5 }).pathname).toContain('5');
    expect(buildParaleloSinDocentesNavTarget()).toEqual({ pathname: HORARIOS_GESTION_PATH });
    expect(labelParaleloSinDocentesCta(soloChoque)).toBe('Resolver conflictos');
    expect(labelParaleloSinDocentesCta({})).toBe('Asignar docentes');
    expect(permisoParaleloSinDocentesCta(soloChoque).accion).toBe('EDITAR');
    expect(permisoParaleloSinDocentesCta({}).accion).toBe('DETALLE');
  });
  it('formatea el destino de navegación', () => {
    expect(formatHorariosNavTarget({ pathname: '/x', search: '?a=1', state: { s: 1 } })).toEqual({ to: '/x?a=1', state: { s: 1 } });
    expect(formatHorariosNavTarget()).toEqual({ to: HORARIOS_GESTION_PATH, state: undefined });
  });
});

describe('permisos de asignación docente', () => {
  const has = (...allowed) => vi.fn((perm, acc) => allowed.includes(`${perm}:${acc}`));
  it('acepta el permiso nuevo o el legacy', () => {
    expect(canListarAsignacion(has(`${PERM_ASIGNACION_DOCENTE}:LISTAR`))).toBe(true);
    expect(canListarAsignacion(has(`${PERM_ASIGNACION_LEGACY}:EDITAR`))).toBe(true);
    expect(canListarAsignacion(has())).toBe(false);
    expect(canEditarAsignacion(has(`${PERM_ASIGNACION_DOCENTE}:CREAR`))).toBe(true);
    expect(canEditarAsignacion(has())).toBe(false);
    expect(canEliminarAsignacion(has(`${PERM_ASIGNACION_LEGACY}:ELIMINAR`))).toBe(true);
    expect(canEliminarAsignacion(has())).toBe(false);
    expect(canGestionarColor(has(`${PERM_ASIGNACION_DOCENTE}:EDITAR`))).toBe(true);
    expect(canGestionarColor(has())).toBe(false);
    expect(canVerCarga(has(`${PERM_ASIGNACION_DOCENTE}:LISTAR`))).toBe(true);
    expect(canVerCarga(has())).toBe(false);
  });
  it('constantes del tablero', () => {
    expect(STATUS_ORDER).toEqual([...BOARD_COLUMNS, 'completo']);
  });
});

describe('estado editable del paralelo en gestión', () => {
  it('bloquea según estado', () => {
    expect(isParaleloGestionHorarioEditable('borrador')).toBe(true);
    expect(isParaleloGestionHorarioEditable('PUBLICADO')).toBe(false);
    expect(isParaleloGestionHorarioEditable('')).toBe(false);
    expect(isParaleloGestionPlanSemanalEditable('PUBLICADO')).toBe(true);
    expect(isParaleloGestionPlanSemanalEditable('CERRADO')).toBe(false);
    expect(isParaleloGestionCoberturaReajustable('CERRADO')).toBe(false);
    expect(isParaleloGestionCoberturaReajustable('x')).toBe(true);
  });
  it('mensajes por estado', () => {
    expect(mensajeParaleloGestionCoberturaNoReajustable('CERRADO')).toMatch(/CERRADO/);
    expect(mensajeParaleloGestionCoberturaNoReajustable('x')).toMatch(/no admite reajuste/);
    expect(mensajeParaleloGestionNoEditable('PUBLICADO')).toMatch(/PUBLICADO/);
    expect(mensajeParaleloGestionNoEditable('CERRADO')).toMatch(/CERRADO/);
    expect(mensajeParaleloGestionNoEditable('x')).toMatch(/no admite cambios/);
    expect(mensajeParaleloGestionPlanNoEditable('CERRADO')).toMatch(/CERRADO/);
    expect(mensajeParaleloGestionPlanNoEditable('PUBLICADO')).toMatch(/PUBLICADO/);
  });
});

describe('paraleloScheduleToCourseSchedules', () => {
  it('desempaqueta payloads y mapea cursos', () => {
    expect(unwrapParaleloSchedulePayload(null)).toEqual([]);
    expect(unwrapParaleloSchedulePayload([1])).toEqual([1]);
    expect(unwrapParaleloSchedulePayload({ schedule: [2] })).toEqual([2]);
    expect(unwrapParaleloSchedulePayload({})).toEqual([]);
    expect(extractParaleloScheduleMeta({ paralelo: { a: 1 } })).toEqual({ a: 1 });
    expect(extractParaleloScheduleMeta([])).toBeNull();
    const [c] = paraleloScheduleToCourseSchedules(
      { schedule: [{ cursoId: 1, materiaSigla: 'MAT', color: '#f00', docenteNombre: 'Ana', horarios: [{ id: 5, ordenSecuencia: 1, horario: { dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45' }, aula: 'A1' }] }] },
      { turno: 'NOCHE', paraleloNombre: 'A' },
    );
    expect(c).toMatchObject({ cursoCodigo: 'MAT', cursoColorHex: '#f00', docente: 'Ana' });
    expect(c.bloques[0]).toMatchObject({ cursoHorarioId: 5, dia: 'LUNES', turno: 'NOCHE', paralelo: 'A', aula: 'A1' });
    expect(paraleloScheduleToCourseSchedules([{ cursoId: 2 }])[0]).toMatchObject({ cursoCodigo: '—', bloques: [] });
  });
});

describe('resumen del tablero y CTA de sin-horarios', () => {
  const base = { paraleloAulaId: 1 };
  it('resume por bucket', () => {
    expect(resumenTableroParaleloCard({ boardBucket: 'completo' })).toMatch(/listo para publicar/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios', cursosTotales: 3, cursosCreados: 1 })).toMatch(/Faltan 2 curso/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios', conflictosSolapeMismoBloque: 1 })).toMatch(/solapes/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios', ofertasCoberturaIncompleta: 2 })).toMatch(/2 materia/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios', cursosSinBloquesHorario: 1 })).toMatch(/1 materia\(s\) sin cobertura/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios', conflictosAula: 2 })).toMatch(/2 cruce/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_horarios' })).toMatch(/Complete los cursos/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_docentes', cursosSinDocente: 2 })).toMatch(/2 materia/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_docentes' })).toMatch(/choque/);
    expect(resumenTableroParaleloCard({ boardBucket: 'sin_aulas' })).toMatch(/no tiene aula base/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_aulas', bloquesSinAula: 2 })).toMatch(/2 bloque/);
    expect(resumenTableroParaleloCard({ ...base, boardBucket: 'sin_aulas' })).toMatch(/Asigne un aula base/);
    expect(resumenTableroParaleloCard({ boardBucket: 'otro' })).toMatch(/Revise el armado/);
    expect(resumenTableroParaleloCard({ ...base, cursosTotales: 2, cursosCreados: 2, cursosAsignados: 2 })).toMatch(/listo/);
  });
  it('resuelve la CTA', () => {
    expect(resolveSinHorariosCta({ ...base, conflictosAula: 1 }).kind).toBe('cruce-aula');
    expect(resolveSinHorariosCta({ ...base, cursosTotales: 3, cursosCreados: 1 }).kind).toBe('faltan-cursos');
    expect(resolveSinHorariosCta({ ...base, ofertasCoberturaIncompleta: 1 }).kind).toBe('cobertura');
    expect(resolveSinHorariosCta({ ...base, conflictosSolapeMismoBloque: 1 }).kind).toBe('conflicto');
  });
  it('detecta duplicados de horario y aula', () => {
    const cursos = [{ id: 1 }, { id: 2 }];
    expect(detectarConflictos(cursos, { 1: [{ horarioId: 1, aulaId: 1 }], 2: [{ horarioId: 1, aulaId: 1 }] })).toBe(true);
    expect(detectarConflictos(cursos, { 1: [{ horarioId: 1, aulaId: 1 }], 2: [{ horarioId: 1, aulaId: 2 }] })).toBe(false);
  });
});

describe('utilidades varias de armado', () => {
  it('resume el guardado masivo', () => {
    expect(summarizeBulkAsignacionHorarios(null)).toBeNull();
    expect(summarizeBulkAsignacionHorarios({ completo: true })).toBeNull();
    expect(summarizeBulkAsignacionHorarios({ completo: false, resultados: [{ success: false, error: 'a' }, { success: false, error: 'a' }, { success: true }] })).toBe('a');
    expect(summarizeBulkAsignacionHorarios({ completo: false })).toBe('No se guardaron todos los bloques solicitados.');
  });
  it('sincroniza los query params del armado', () => {
    const next = syncArmadoSearchParams('paralelo=A&turno=x&asignarCurso=1&z=2', { paraleloGestionId: 4, tab: 'plan' });
    expect(next.toString()).toBe('z=2&pg=4&tab=plan');
    expect(armadoSearchParamsEqual(next, new URLSearchParams('z=2&pg=4&tab=plan'))).toBe(true);
    expect(syncArmadoSearchParams('', { paraleloGestionId: 0 }).toString()).toBe('');
  });
  it('arma la URL de la imagen de carrera', () => {
    expect(buildCarreraImageUrl(null)).toBeNull();
    expect(buildCarreraImageUrl('https://x/y.png')).toBe('https://x/y.png');
    expect(buildCarreraImageUrl('uploads/a.png')).toMatch(/\/uploads\/a\.png$/);
    expect(buildCarreraImageUrl('/uploads/a.png')).not.toMatch(/\/api\//);
  });
  it('define los pasos del flujo', () => {
    expect(HORARIOS_STEPS.map((s) => s.key)).toEqual(['gestion', 'armado', 'conflictos', 'publicacion']);
  });
});
