import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NOTA_HISTORIAL,
  buildHistorialPrevioRows,
  buildPriorHistoryPayload,
  computeConcludedPeriods,
  historialPrevioEstadoLabel,
  historialPrevioRowKey,
  isHistorialPrevioPendiente,
  listHistorialMateriasDePeriodo,
  parseHistorialPrevioRowKey,
  requiereHistorialPrevio,
  resolveDefaultNotaHistorial,
  resolveRowStatus,
  seedHistorialFromPriorEnrollmentHistories,
  validateHistorialPrevioGrades,
} from '../historialPrevioHelpers';
import {
  applyMatriculaListFilters,
  buildMatriculaListFilterOptions,
  emptyMatriculaListFilters,
  hasActiveMatriculaListFilters,
} from '../matriculaListFilters';

describe('historialPrevioHelpers', () => {
  it('nota por defecto y requerimiento por tipo de admisión', () => {
    expect(resolveDefaultNotaHistorial()).toBe(DEFAULT_NOTA_HISTORIAL);
    expect(resolveDefaultNotaHistorial({ notaMinimaAprobacion: '51' })).toBe(51);
    expect(resolveDefaultNotaHistorial({ notaMinimaAprobacion: 0 })).toBe(DEFAULT_NOTA_HISTORIAL);
    expect(requiereHistorialPrevio('antiguo')).toBe(true);
    expect(requiereHistorialPrevio('NUEVO')).toBe(false);
    expect(requiereHistorialPrevio('ANTIGUO', false)).toBe(false);
    expect(requiereHistorialPrevio(null)).toBe(false);
  });

  it('historial pendiente según el estado o la cantidad registrada', () => {
    expect(isHistorialPrevioPendiente({ tipoInscripcion: 'ANTIGUO', cantidadHistorialPrevio: 0 })).toBe(true);
    expect(isHistorialPrevioPendiente({ enrollment: { tipoInscripcion: 'TRASPASO' }, cantidadHistorialPrevio: 3 })).toBe(false);
    expect(isHistorialPrevioPendiente({ tipoInscripcion: 'ANTIGUO', requiereHistorialPrevio: false })).toBe(false);
    expect(isHistorialPrevioPendiente({ tipoInscripcion: 'ANTIGUO', historialPrevioEstado: 'PENDIENTE' })).toBe(true);
    expect(isHistorialPrevioPendiente({ tipoInscripcion: 'NUEVO' })).toBe(false);
    expect(isHistorialPrevioPendiente(null)).toBe(false);
  });

  const periodos = [
    { id: 1, numero: 1, nombre: 'Primero' },
    { id: 2, numero: 2 },
    { id: 3, numero: 3 },
  ];

  it('computeConcludedPeriods: alcance por materia hasta el periodo más alto', () => {
    expect(computeConcludedPeriods({ tipoAdmision: 'NUEVO', periodos, selectedPeriodIds: [3] })).toEqual([]);
    expect(computeConcludedPeriods({ tipoAdmision: 'ANTIGUO', periodos: [] })).toEqual([]);
    const r = computeConcludedPeriods({
      tipoAdmision: 'ANTIGUO',
      periodos,
      selectedPeriodIds: ['2'],
      selectedMateriaIdsByPeriod: { 2: [7, 'x'] },
    });
    expect(r.map((p) => p.periodId)).toEqual([1, 2]);
    expect(r[0]).toMatchObject({ periodName: 'Primero', status: 'CONVALIDADO', selectedMateriaIds: [] });
    expect(r[1]).toMatchObject({ periodName: 'Periodo 2', selectedMateriaIds: [7] });
    expect(computeConcludedPeriods({ tipoAdmision: 'ANTIGUO', periodos })).toEqual([]);
  });

  it('computeConcludedPeriods: traspaso incluye los periodos bloqueados', () => {
    const r = computeConcludedPeriods({
      tipoAdmision: 'TRASPASO',
      periodos,
      selectedPeriodIds: [3],
      periodosDisabledByTraspaso: { 1: true },
      selectedMateriaIdsByPeriod: { '3': [9] },
    });
    expect(r.map((p) => p.periodId)).toEqual([1, 2, 3]);
    expect(r[0].selectedMateriaIds).toEqual([]);
    expect(r[2].selectedMateriaIds).toEqual([9]);
    const solo = computeConcludedPeriods({ tipoAdmision: 'TRASPASO', periodos, periodosDisabledByTraspaso: { 1: true } });
    expect(solo.map((p) => p.periodId)).toEqual([1]);
  });

  const materiasByPeriod = {
    1: [{ id: 10, sigla: 'A', nombre: 'Alfa' }, { id: 11, sigla: 'B', nombre: 'Beta' }, { sigla: 'sin id' }],
    '2': [{ id: 20, sigla: 'C', nombre: 'Gamma' }],
  };
  const concluded = [
    { periodId: 1, periodName: 'P1', periodNumero: 1, status: 'CONVALIDADO', selectedMateriaIds: [11] },
    { periodId: 2, periodName: 'P2', periodNumero: 2, status: 'APROBADO', selectedMateriaIds: [] },
  ];

  it('claves de fila y estado', () => {
    expect(historialPrevioRowKey(1, 2)).toBe('1:2');
    expect(parseHistorialPrevioRowKey('4:5')).toEqual({ periodId: 4, materiaId: 5 });
    expect(resolveRowStatus({ k: 'aprobado' }, 'k')).toBe('APROBADO');
    expect(resolveRowStatus({ k: 'raro' }, 'k')).toBe('CONVALIDADO');
    expect(resolveRowStatus(undefined, 'k', 'APROBADO')).toBe('APROBADO');
    expect(resolveRowStatus({}, 'k')).toBe('CONVALIDADO');
  });

  it('lista y construye filas excluyendo las materias cursadas', () => {
    expect(listHistorialMateriasDePeriodo(concluded[0], materiasByPeriod).map((m) => m.id)).toEqual([10]);
    expect(listHistorialMateriasDePeriodo({ periodId: 9 }, materiasByPeriod)).toEqual([]);
    const rows = buildHistorialPrevioRows(concluded, materiasByPeriod, { '2:20': 80 }, { '1:10': 'APROBADO' });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ key: '1:10', status: 'APROBADO', nota: null, gestionAcademica: 'P1' });
    expect(rows[1]).toMatchObject({ key: '2:20', status: 'APROBADO', nota: 80 });
  });

  it('payload: solo filas con nota válida cuando están aprobadas', () => {
    const p = buildPriorHistoryPayload({ '2:20': '75' }, { '1:10': 'CONVALIDADO' }, concluded, materiasByPeriod);
    expect(p).toEqual([
      { materia_id: 10, period_id: 1, status: 'CONVALIDADO', final_grade: null },
      { materia_id: 20, period_id: 2, status: 'APROBADO', final_grade: 75 },
    ]);
    expect(buildPriorHistoryPayload({ '2:20': 'abc' }, {}, concluded, materiasByPeriod)).toHaveLength(1);
    expect(buildPriorHistoryPayload({}, {}, concluded, materiasByPeriod)).toHaveLength(1);
  });

  it('siembra el historial desde inscripciones previas', () => {
    expect(seedHistorialFromPriorEnrollmentHistories(null)).toEqual({ gradesByKey: {}, statusByKey: {} });
    const r = seedHistorialFromPriorEnrollmentHistories([
      { periodoId: 1, materiaId: 2, estado: 'APROBADO', notaFinal: '70' },
      { period_id: 3, materia_id: 4, status: 'convalidado' },
      { periodId: 5, materia_id: 6, final_grade: '' },
      { materiaId: 1 },
    ]);
    expect(r.statusByKey).toEqual({ '1:2': 'APROBADO', '3:4': 'CONVALIDADO', '5:6': 'APROBADO' });
    expect(r.gradesByKey).toEqual({ '1:2': 70 });
  });

  it('etiquetas del estado del historial', () => {
    expect(historialPrevioEstadoLabel('registrado').color).toBe('success');
    expect(historialPrevioEstadoLabel('PENDIENTE').color).toBe('warning');
    expect(historialPrevioEstadoLabel(undefined)).toEqual({ text: 'No aplica', color: 'default' });
  });

  it('valida notas: faltantes, fuera de rango y válidas', () => {
    expect(validateHistorialPrevioGrades({}, {}, [], {})).toEqual({ valid: true, missing: 0, invalid: [], invalidKeys: [] });
    const mb = { 1: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] };
    const per = [{ periodId: 1, periodName: 'P', periodNumero: 1, status: 'APROBADO' }];
    const r = validateHistorialPrevioGrades({ '1:1': 120, '1:2': 50, '1:3': '' }, { '1:4': 'CONVALIDADO' }, per, mb);
    expect(r.valid).toBe(false);
    expect(r.missing).toBe(1);
    expect(r.invalid[0]).toMatchObject({ key: '1:1', reason: 'La nota debe estar entre 0 y 100' });
    expect(r.invalidKeys).toEqual(['1:1', '1:3']);
    expect(r.total).toBe(4);
    const ok = validateHistorialPrevioGrades({ '1:1': 1, '1:2': 2, '1:3': 3 }, { '1:4': 'CONVALIDADO' }, per, mb);
    expect(ok.valid).toBe(true);
  });
});

describe('matriculaListFilters', () => {
  const rows = [
    { carrera: { id: 1, nombre: 'Sistemas', codigo: 'SIS' }, paralelo: { id: 5, nombre: 'A', turno: 'MAÑANA' }, periodo: { id: 7, numero: 2, nombre: 'Segundo' }, tipoInscripcion: 'nuevo', historialPrevioEstado: 'PENDIENTE' },
    { carreraId: 2, paraleloId: 6, periodoId: 8, periodoNumero: 1, tipoInscripcion: 'ANTIGUO', historialPrevioEstado: 'REGISTRADO' },
    {},
  ];

  it('arma las opciones únicas ordenadas', () => {
    const o = buildMatriculaListFilterOptions(rows);
    expect(o.carreras.map((c) => c.nombre)).toEqual(['Carrera 2', 'Sistemas']);
    expect(o.paralelos.map((p) => p.nombre)).toEqual(['A (MAÑANA)', 'Paralelo 6']);
    expect(o.periodos.map((p) => p.nombre)).toEqual(['Periodo 1', 'Segundo']);
    expect(buildMatriculaListFilterOptions()).toEqual({ carreras: [], paralelos: [], periodos: [] });
  });

  it('ordena periodos con el mismo número por nombre', () => {
    const o = buildMatriculaListFilterOptions([
      { periodoId: 1, periodoNumero: 1, periodo: { nombre: 'B' } },
      { periodoId: 2, periodoNumero: 1, periodo: { nombre: 'A' } },
    ]);
    expect(o.periodos.map((p) => p.nombre)).toEqual(['A', 'B']);
  });

  it('aplica cada filtro', () => {
    const f = (x) => applyMatriculaListFilters(rows, x);
    expect(f({})).toHaveLength(3);
    expect(f({ carreraId: '1' })).toHaveLength(1);
    expect(f({ paraleloId: 6 })).toHaveLength(1);
    expect(f({ periodoId: 7 })).toHaveLength(1);
    expect(f({ tipoInscripcion: 'NUEVO' })).toHaveLength(1);
    expect(f({ historialPrevioEstado: 'REGISTRADO' })).toHaveLength(1);
    expect(applyMatriculaListFilters(undefined, undefined)).toEqual([]);
  });

  it('detecta filtros activos', () => {
    expect(hasActiveMatriculaListFilters(emptyMatriculaListFilters())).toBe(false);
    expect(hasActiveMatriculaListFilters()).toBe(false);
    expect(hasActiveMatriculaListFilters({ carreraId: 1 })).toBe(true);
    expect(hasActiveMatriculaListFilters({ historialPrevioEstado: 'X' })).toBe(true);
  });
});
