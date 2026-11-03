import { describe, it, expect } from 'vitest';
import { buildDocenteAsignacionesTabla } from '../buildDocenteAsignacionesTabla';
import { filterAssignmentsGestionVigente } from '../filterAssignmentsGestionVigente';
import { buildAulasParaModalItems } from '../ofertaAulaModal';
import {
  normalizeTurnoKey,
  buildContextoBand,
  paraleloEstadoPillClass as bandPillClass,
  buildDocenteValue,
  buildHorarioValue,
  buildProgressDots,
  mapParaleloToCardModel,
} from '../ofertaParaleloCardModel';
import {
  paraleloEstadoPillClass,
  ofertaCursoDocentePillClass,
  ofertaCursoEstadoPillClass,
  aulaParaleloLabel,
  paraleloCupoLabel,
  paraleloDocenteResumen,
  paraleloAsignacionFlags,
} from '../ofertaParaleloUi';
import { ofertaPaths, normalizeDocenteAsignacionesTab, DOCENTE_ASIGNACIONES_TABS } from '../../config/paths';
import { mapParaleloGestionContextModel } from '../../../common/utils/mapParaleloGestionContextModel';

describe('buildDocenteAsignacionesTabla', () => {
  it('agrupa por carrera y totaliza horas', () => {
    const t = buildDocenteAsignacionesTabla({
      profile: { nombres: 'Juan', apellidoPaterno: 'Pérez', tituloProfesional: 'Ing.', ci: '123' },
      docenteId: 4,
      gestionLabel: '2026',
      assignments: [
        { carrera: 'Sistemas', materia: 'Mate', siglaMateria: 'MAT', cargaHorariaSemanal: 4, carreraColorHex: 'ff0000', paralelo: 'A' },
        { materia: 'Física', horasPlanMateria: 2 },
        { carrera: 'Sistemas', cursoCodigo: 'X' },
      ],
    });
    expect(t.docenteNombre).toBe('PÉREZ JUAN');
    expect(t).toMatchObject({ perfil: 'Ing.', numeroItem: '123', rowCount: 3, gestionLabel: '2026' });
    expect(t.totales).toEqual({ horasSemana: 6, horasMes: 24 });
    expect(t.carreraGroups).toEqual([
      { carrera: 'Sistemas', carreraColorHex: '#ff0000', startIdx: 0, rowSpan: 2 },
      { carrera: 'Sin carrera', carreraColorHex: null, startIdx: 2, rowSpan: 1 },
    ]);
    expect(t.filas[1]).toMatchObject({ asignatura: '—', codigo: 'X', anio: '—' });
    expect(t.filas[2]).toMatchObject({ asignatura: 'Física', codigo: '—', horasSemana: 2 });
  });
  it('usa respaldos sin perfil', () => {
    const t = buildDocenteAsignacionesTabla({ profile: { nombreCompleto: 'ana' }, docenteId: 9 });
    expect(t).toMatchObject({ docenteNombre: 'ANA', perfil: '—', numeroItem: '9', rowCount: 0 });
    expect(buildDocenteAsignacionesTabla({}).numeroItem).toBe('—');
  });
});

describe('filterAssignmentsGestionVigente', () => {
  const as = [{ gestion: '2026 Regular' }, { gestion: '2025' }, { gestion: '' }, { gestion: 'x', vigente: false }];
  it('descarta no vigentes y filtra por año o nombre', () => {
    expect(filterAssignmentsGestionVigente(as)).toHaveLength(3);
    expect(filterAssignmentsGestionVigente(as, { anio: 2026 })).toEqual([as[0], as[2]]);
    expect(filterAssignmentsGestionVigente(as, { nombre: 'regular' })).toEqual([as[0], as[2]]);
    expect(filterAssignmentsGestionVigente(null)).toEqual([]);
  });
});

describe('buildAulasParaModalItems', () => {
  it('excluye aulas ocupadas por otros paralelos y pone la actual primero', () => {
    const items = buildAulasParaModalItems({
      aulas: [{ id: 1, nombre: 'Zeta', capacidad: '30' }, { id: 2, nombre: 'Beta' }, { id: 3, nombre: 'Ocupada' }, { id: 2, nombre: 'Dup' }, { id: 0 }],
      paralelosEnPlan: [{ id: 10, aulaId: 3, paraleloNombre: 'B' }, { id: 11, aulaId: 1 }, { id: 5, aulaId: 9 }],
      paraleloGestionId: 11,
      aulaIdActual: 2,
    });
    expect(items.map((i) => i.id)).toEqual([2, 1]);
    expect(items[0].isCurrent).toBe(true);
    expect(items[1].capacidad).toBe(30);
  });
  it('agrega el aula actual desde el detalle si no está en el catálogo', () => {
    const items = buildAulasParaModalItems({
      aulas: [{ id: 1, nombre: 'A' }],
      aulaIdActual: 7,
      detalle: { aulaCodigo: 'C7', aulaNombre: 'Aula 7', aulaCapacidad: 20, aulaCategoria: 'LAB' },
    });
    expect(items[0]).toMatchObject({ id: 7, codigo: 'C7', nombre: 'Aula 7', capacidad: 20, categoria: 'LAB', isCurrent: true });
    expect(buildAulasParaModalItems({})).toEqual([]);
  });
});

describe('ofertaParaleloUi', () => {
  it('devuelve clases por estado', () => {
    expect(paraleloEstadoPillClass('publicado')).toMatch(/activa/);
    expect(paraleloEstadoPillClass('OFERTADO')).toMatch(/teorica/);
    expect(paraleloEstadoPillClass('BORRADOR')).toMatch(/clasificacion/);
    expect(paraleloEstadoPillClass(null)).toMatch(/default/);
    expect(ofertaCursoDocentePillClass(true)).toMatch(/clasificacion/);
    expect(ofertaCursoDocentePillClass(false)).toMatch(/activa/);
    expect(ofertaCursoEstadoPillClass('ACTIVA')).toMatch(/activa/);
    expect(ofertaCursoEstadoPillClass('PROGRAMADA')).toMatch(/teorica/);
    expect(ofertaCursoEstadoPillClass('cancelada')).toMatch(/inactiva/);
    expect(ofertaCursoEstadoPillClass('x')).toMatch(/default/);
  });
  it('etiqueta aula y cupo', () => {
    expect(aulaParaleloLabel({ aulaCodigo: 'A1', aulaNombre: 'Uno' })).toBe('A1 — Uno');
    expect(aulaParaleloLabel({ aulaCodigo: 'A1' })).toBe('A1');
    expect(aulaParaleloLabel({ aulaNombre: 'Uno' })).toBe('Uno');
    expect(aulaParaleloLabel(null)).toBeNull();
    expect(paraleloCupoLabel({ cupoMinimo: 5, cupoMaximo: 30 })).toBe('Cupo: 5–30');
    expect(paraleloCupoLabel({ cupoMaximo: 30 })).toBe('Cupo máx.: 30');
    expect(paraleloCupoLabel({ cupoMinimo: 5 })).toBe('Cupo mín.: 5');
    expect(paraleloCupoLabel({})).toBeNull();
  });
  it('resume docentes y banderas de asignación', () => {
    expect(paraleloDocenteResumen(null)).toBeNull();
    expect(paraleloDocenteResumen({ cursos_total: 0 })).toBeNull();
    expect(paraleloDocenteResumen({ cursosTotal: 2, cursosConDocente: 2 })).toBe('Docente: completo');
    expect(paraleloDocenteResumen({ cursos_total: 3, cursos_con_docente: 1 })).toBe('Docente: 1/3 cursos');
    expect(paraleloDocenteResumen({ cursos_total: 3, cursos_con_docente: 0 })).toBe('Docente: pendiente');
    expect(paraleloAsignacionFlags({ aulaId: 1, bloquesRequeridos: 4, bloquesAsignados: 4 }, { cursos_total: 2, cursos_con_docente: 2 })).toEqual({ aula: true, docente: true, docenteParcial: false, horarios: true, horariosEnArmado: false });
    expect(paraleloAsignacionFlags({ bloquesRequeridos: 4, bloquesAsignados: 1 }, { cursos_total: 2, cursos_con_docente: 1 })).toMatchObject({ aula: false, docenteParcial: true, horariosEnArmado: true });
  });
});

describe('ofertaParaleloCardModel', () => {
  it('normaliza el turno', () => {
    expect(normalizeTurnoKey('Mañana')).toBe('manana');
    expect(normalizeTurnoKey('noche')).toBe('noche');
    expect(normalizeTurnoKey('TARDE')).toBe('tarde');
    expect(normalizeTurnoKey(null)).toBe('default');
  });
  it('arma banda de contexto', () => {
    const b = buildContextoBand({ id: 3, carreraNombre: 'Sistemas', periodoNumero: 2, turno: 'noche' });
    expect(b).toMatchObject({ carreraPeriodo: 'Sistemas · 2er año', nombre: 'Paralelo #3', subtitulo: 'Plan vigente · Turno Noche', bandClass: 'opc-band opc-band--noche' });
    expect(buildContextoBand({ carreraCodigo: 'SIS', periodoNombre: 'Primero', planNombre: 'P', paraleloNombre: 'A' })).toMatchObject({ carreraPeriodo: 'SIS · Primero', nombre: 'A', subtitulo: 'P · Turno —' });
    expect(buildContextoBand({}).carreraPeriodo).toBe('— · —');
  });
  it('clases del estado, valores y dots', () => {
    expect(bandPillClass('publicado')).toMatch(/publicado/);
    expect(bandPillClass('OFERTADO')).toMatch(/ofertado/);
    expect(bandPillClass('BORRADOR')).toMatch(/borrador/);
    expect(bandPillClass('CERRADO')).toMatch(/cerrado/);
    expect(bandPillClass('x')).toMatch(/default/);
    expect(buildDocenteValue({ docente_nombre: 'Ana' }, { docente: true })).toEqual({ text: 'Ana', variant: 'ok' });
    expect(buildDocenteValue(null, { docente: true }).text).toBe('Completo');
    expect(buildDocenteValue({ cursos_total: 3, cursos_con_docente: 1 }, { docenteParcial: true })).toEqual({ text: '1/3 cursos asignados', variant: 'warn' });
    expect(buildDocenteValue(null, {})).toEqual({ text: 'Pendiente', variant: 'pend' });
    expect(buildHorarioValue('Noche', { horarios: true }).text).toMatch(/18:15–22:00/);
    expect(buildHorarioValue('x', { horarios: true }).text).toMatch(/07:00/);
    expect(buildHorarioValue('x', { horariosEnArmado: true }).text).toBe('En armado');
    expect(buildHorarioValue('x', {}).variant).toBe('pend');
    expect(buildProgressDots({ aula: true, docenteParcial: true, horarios: true }, 'noche')).toEqual(['opc-dot opc-dot--ok-noche', 'opc-dot opc-dot--warn', 'opc-dot opc-dot--ok-noche']);
    expect(buildProgressDots({ horariosEnArmado: true, docente: true }, 'manana')).toEqual(['opc-dot opc-dot--off', 'opc-dot opc-dot--ok-manana', 'opc-dot opc-dot--warn']);
    expect(buildProgressDots({ aula: true }, 'tarde')[0]).toBe('opc-dot opc-dot--ok-tarde');
  });
  it('mapea el paralelo a la tarjeta', () => {
    const card = mapParaleloToCardModel({ id: 1, estado: 'CERRADO', turno: 'tarde', aulaId: 2, aulaNombre: 'Aula', cupoMaximo: 20 }, null);
    expect(card).toMatchObject({ id: 1, ctaLabel: 'Ver detalle', puedeInhabilitar: false, puedeHabilitar: true, cupo: 'Cupo máx.: 20' });
    expect(card.cardClassName).toContain('oferta-paralelo-card--cerrado');
    expect(card.rows.aula).toMatchObject({ value: 'Aula', valueVariant: 'default' });
    const ro = mapParaleloToCardModel({ id: 2 }, null, { soloConsulta: true });
    expect(ro).toMatchObject({ ctaLabel: 'Consultar', puedeInhabilitar: false, puedeHabilitar: false, estado: '—' });
    expect(ro.rows.aula.value).toBe('Sin aula asignada');
  });
});

describe('paths de oferta y contexto', () => {
  it('arma rutas', () => {
    expect(ofertaPaths.gestionPlanesConPlan(1, 2)).toBe('/institucional/oferta/gestiones/1/planes?plan=2');
    expect(ofertaPaths.paraleloDetalle(5)).toBe('/institucional/oferta/paralelo/5');
    expect(ofertaPaths.docenteAsignaciones(3, { tab: 'color' })).toBe('/institucional/oferta/docente/3/asignaciones?tab=color');
    expect(ofertaPaths.docenteAsignaciones(3, { tab: 'otro' })).toBe('/institucional/oferta/docente/3/asignaciones');
    expect(ofertaPaths.docenteAsignaciones('x')).toBe('/institucional/oferta');
    expect(ofertaPaths.dashboard()).toBe('/institucional/oferta');
    expect(normalizeDocenteAsignacionesTab('color')).toBe(DOCENTE_ASIGNACIONES_TABS.COLOR);
    expect(normalizeDocenteAsignacionesTab('zzz')).toBe(DOCENTE_ASIGNACIONES_TABS.HORARIO);
  });
  it('mapea el contexto del paralelo en gestión', () => {
    expect(mapParaleloGestionContextModel(null)).toBeNull();
    expect(mapParaleloGestionContextModel({ paraleloGestionId: '4', paralelo_nombre: 'A', aula_id: 2, descripcion: 'd' })).toMatchObject({ id: 4, paraleloNombre: 'A', aulaId: 2, paraleloDescripcion: 'd' });
    expect(mapParaleloGestionContextModel({ id: 'x' }).id).toBeNull();
  });
});
