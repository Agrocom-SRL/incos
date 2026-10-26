import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  casos: {},
  api: { paralelos: [], loading: false, error: null, fetch: vi.fn() },
}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => R.casos[k] }) }));
vi.mock('@application-academico/paralelos/hooks/useParalelosApi', () => ({ useParalelosApi: () => R.api }));

import { useInscripcionNuevaHistorialPrevio } from '../useInscripcionNuevaHistorialPrevio';
import { useInscripcionNuevaParalelos } from '../useInscripcionNuevaParalelos';

const PERIODOS = [
  { id: 1, numero: 1, nombre: 'Primero' },
  { id: 2, numero: 2, nombre: 'Segundo' },
];
const MATERIAS = {
  1: [{ id: 10, sigla: 'A', nombre: 'Alfa' }, { id: 11, sigla: 'B', nombre: 'Beta' }],
  2: [{ id: 20, sigla: 'C', nombre: 'Gamma' }],
};
const SELECTED = [2];
const SEL_MATERIAS = { 2: [20] };

const props = (extra = {}) => ({
  tipoAdmision: 'ANTIGUO',
  esNuevoSistema: true,
  periodos: PERIODOS,
  selectedPeriodIds: SELECTED,
  selectedMateriaIdsByPeriod: SEL_MATERIAS,
  materiasByPeriod: MATERIAS,
  contexto: { notaMinimaAprobacion: 55 },
  ...extra,
});

describe('useInscripcionNuevaHistorialPrevio', () => {
  it('no pide historial para NUEVO ni para quien ya lo tiene en el sistema', () => {
    const a = renderHook(() => useInscripcionNuevaHistorialPrevio(props({ tipoAdmision: 'NUEVO' }))).result.current;
    expect(a).toMatchObject({ needsHistorial: false, hasRows: false, rows: [] });
    const b = renderHook(() => useInscripcionNuevaHistorialPrevio(props({ esNuevoSistema: false }))).result.current;
    expect(b.needsHistorial).toBe(false);
  });

  it('genera filas de las materias no cursadas, con CONVALIDADO por defecto', () => {
    const { result } = renderHook(() => useInscripcionNuevaHistorialPrevio(props()));
    expect(result.current.hasRows).toBe(true);
    expect(result.current.rows.map((r) => r.key)).toEqual(['1:10', '1:11']);
    expect(result.current.rows.every((r) => r.status === 'CONVALIDADO')).toBe(true);
    expect(result.current.concludedPeriods[0].periodId).toBe(1);
    expect(result.current.buildPayload()).toEqual([
      { materia_id: 10, period_id: 1, status: 'CONVALIDADO', final_grade: null },
      { materia_id: 11, period_id: 1, status: 'CONVALIDADO', final_grade: null },
    ]);
  });

  it('al pasar a APROBADO precarga la nota mínima y la valida; al volver a CONVALIDADO la quita', () => {
    const { result } = renderHook(() => useInscripcionNuevaHistorialPrevio(props()));
    act(() => result.current.setStatus('1:10', 'aprobado'));
    expect(result.current.gradesByKey['1:10']).toBe(55);
    expect(result.current.statusByKey['1:10']).toBe('APROBADO');
    act(() => result.current.setGrade('1:10', 120));
    let v;
    act(() => {
      v = result.current.validate();
    });
    expect(v.valid).toBe(false);
    expect(result.current.invalidGradeKeys).toEqual(['1:10']);
    act(() => result.current.setGrade('1:10', 80));
    expect(result.current.invalidGradeKeys).toEqual([]);
    act(() => {
      v = result.current.validate();
    });
    expect(v.valid).toBe(true);
    expect(result.current.buildPayload()[0]).toMatchObject({ status: 'APROBADO', final_grade: 80 });
    act(() => result.current.setGrade('1:10', 80));
    act(() => result.current.setStatus('1:10', 'APROBADO'));
    act(() => result.current.setStatus('1:10', 'otra'));
    expect(result.current.gradesByKey).not.toHaveProperty('1:10');
    act(() => result.current.setStatus('1:11', 'CONVALIDADO'));
  });

  it('en edición siembra las notas desde el historial guardado', () => {
    const previos = [{ periodoId: 1, materiaId: 10, estado: 'APROBADO', notaFinal: 77 }];
    const { result } = renderHook(() => useInscripcionNuevaHistorialPrevio(props({ isEditMode: true, initialPriorHistories: previos })));
    expect(result.current.gradesByKey['1:10']).toBe(77);
    expect(result.current.rows[0]).toMatchObject({ status: 'APROBADO', nota: 77 });
  });

  it('mientras cargan las materias no precarga notas', () => {
    const { result } = renderHook(() => useInscripcionNuevaHistorialPrevio(props({ materiasLoading: true })));
    expect(result.current.materiasLoading).toBe(true);
    expect(result.current.gradesByKey).toEqual({});
  });
});

describe('useInscripcionNuevaParalelos', () => {
  const para = (id, periodoId, extra = {}) => ({ id, nombre: `P${id}`, codigo: `C${id}`, carreraId: 1, periodoId, materiaId: 5, ...extra });

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(R.casos).forEach((k) => delete R.casos[k]);
    R.api = { paralelos: [], loading: false, error: null, fetch: vi.fn() };
  });

  it('sin periodo no consulta; con un periodo y carrera consulta y expone lo recibido', () => {
    renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1 }));
    expect(R.api.fetch).not.toHaveBeenCalled();
    R.api.paralelos = [para(1, 7)];
    const { result } = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoId: 7 }));
    expect(R.api.fetch).toHaveBeenCalledWith({ params: { periodo_id: 7, carrera_id: 1 } });
    expect(result.current.paralelos).toHaveLength(1);
    act(() => result.current.refetch());
    expect(R.api.fetch).toHaveBeenCalledTimes(2);
  });

  it('selecciona un paralelo por periodo y descarta periodos que ya no están', () => {
    const { result, rerender } = renderHook(({ ids }) => useInscripcionNuevaParalelos({ carreraId: 1, periodoIds: ids }), { initialProps: { ids: [7] } });
    act(() => result.current.onSelectParalelo(null));
    act(() => result.current.onSelectParalelo({ id: 1 }));
    expect(result.current.selectedParalelo).toBeNull();
    act(() => result.current.onSelectParalelo({ ...para(1, 7), extra: 'x' }));
    expect(result.current.selectedParalelosByPeriod[7]).toEqual({ id: 1, nombre: 'P1', codigo: 'C1', carreraId: 1, periodoId: 7, materiaId: 5 });
    const prev = result.current.selectedParalelosByPeriod;
    act(() => result.current.onSelectParalelo(para(1, 7)));
    expect(result.current.selectedParalelosByPeriod).toBe(prev);
    act(() => result.current.onSelectParalelo({ id: 3, periodo_id: 8 }));
    expect(result.current.selectedParalelo.id).toBe(1);
    rerender({ ids: [8] });
    expect(Object.keys(result.current.selectedParalelosByPeriod)).toEqual(['8']);
    expect(result.current.selectedParalelo.id).toBe(3);
  });

  it('preselecciona el paralelo inicial y los paralelos iniciales por periodo', () => {
    R.api.paralelos = [para(4, 7), para(5, 8)];
    const a = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoId: 7, initialParaleloId: '4' }));
    expect(a.result.current.selectedParalelo.id).toBe(4);
    const inicial = { 7: 4, 9: null, 10: 99 };
    const b = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoIds: [7], initialParallelIdsByPeriod: inicial }));
    expect(b.result.current.selectedParalelosByPeriod[7].id).toBe(4);
  });

  it('con varios periodos junta los paralelos de cada uno', async () => {
    const ejecutar = vi.fn(async ({ params }) => ({ success: true, data: { paralelos: [{ id: params.periodo_id * 10, nombre: 'P', periodoId: params.periodo_id }] } }));
    R.casos.obtenerTodosParalelos = () => ({ ejecutar });
    const { result } = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoIds: [1, 2] }));
    await waitFor(() => expect(result.current.paralelos).toHaveLength(2));
    expect(result.current.loading).toBe(false);
    ejecutar.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: { paralelos: [] } });
    await act(async () => result.current.refetch());
    await waitFor(() => expect(result.current.paralelos).toHaveLength(0));
  });

  it('varios periodos: errores y caso de uso no disponible', async () => {
    R.casos.obtenerTodosParalelos = () => ({ ejecutar: vi.fn().mockRejectedValue(new Error('Caída')) });
    const a = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoIds: [1, 2] }));
    await waitFor(() => expect(a.result.current.error).toBe('Caída'));
    await act(async () => a.result.current.refetch());
    delete R.casos.obtenerTodosParalelos;
    const b = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1, periodoIds: [1, 2] }));
    await waitFor(() => expect(b.result.current.error).toBe('No disponible'));
    act(() => b.result.current.refetch());
    const c = renderHook(() => useInscripcionNuevaParalelos({ carreraId: 1 }));
    act(() => c.result.current.refetch());
  });
});
