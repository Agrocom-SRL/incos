/**
 * useGestionHorariosConflictosState: resolución de conflictos de un docente en
 * su grilla y en la de cada paralelo involucrado. Los mappers/utils de cálculo
 * tienen su propia prueba; aquí se verifica la orquestación (carga, vistas,
 * validación de colocación y guardado).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { state: null },
  search: new URLSearchParams(),
  setSearch: vi.fn(),
  app: null,
  http: { get: vi.fn() },
  gestiones: [],
  pendientes: { data: null },
  bulk: { ejecutarBulk: vi.fn(), loading: false },
  validar: vi.fn(),
  live: new Set(),
  bulkItems: { items: [], incomplete: false },
  handleErrorResponse: vi.fn(),
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => R.navigate,
  useLocation: () => R.location,
  useSearchParams: () => [R.search, R.setSearch],
}));
vi.mock('@api-client', () => ({ default: R.http }));
vi.mock('@api/responseHandler', () => ({
  handleSuccessResponse: (r) => r,
  handleErrorResponse: (...a) => R.handleErrorResponse(...a),
}));
vi.mock('@application-shared/hooks', async (orig) => ({
  ...(await orig()),
  useGestionesCatalogApi: () => ({ gestiones: R.gestiones }),
}));
vi.mock('../../api/useHorariosPendientesSidebarApi', () => ({ useHorariosPendientesSidebarApi: () => R.pendientes }));
vi.mock('../../api/useBulkAsignacionHorariosApi', () => ({ useBulkAsignacionHorariosApi: () => R.bulk }));
vi.mock('../../api/useValidarConflictoHorarioApi', () => ({ useValidarConflictoHorarioApi: () => ({ validar: R.validar }) }));

// Mappers y utilidades de cálculo: cubiertos en sus propias pruebas.
vi.mock('@application-institucional/horarios/mappers/docenteGrillaConflictosMapper', () => ({
  mapDocenteGrillaConflictosFromApi: (raw) => raw ?? null,
}));
vi.mock('@application-institucional/horarios/mappers/grillaHorarioMapper', () => ({
  extractGrillaHorarioMeta: () => ({ turno: 'TARDE', paraleloGestionEstado: R.estadoPg }),
  grillaHorarioToCourseSchedules: () => R.pgSchedules,
}));
vi.mock('@application-institucional/horarios/utils/buildHorarioSlotIndex', () => ({
  buildHorarioSlotIndexFromFranjas: () => ({ origen: 'docente' }),
  buildHorarioSlotIndexFromGrilla: () => ({ origen: 'paralelo' }),
  resolveHorarioIdForBloque: () => R.horarioResuelto,
}));
vi.mock('@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems', () => ({
  buildBulkAsignacionHorarioItems: () => R.bulkItems,
}));
vi.mock('@application-institucional/horarios/utils/computeConflictosBloquesLive', () => ({
  buildMergedDocenteSchedules: () => [],
  computeConflictHorarioIds: () => R.live,
}));
vi.mock('@application-institucional/horarios/utils/resolveParalelosTabsConflicto', () => ({
  resolveParalelosConflictoHorarioResolucion: (_pares, _keys, involucrados) => involucrados,
  solapeParaleloHorarioKeySet: (keys) => new Set(keys),
}));

import { useGestionHorariosConflictosState } from '../useGestionHorariosConflictosState';

const GESTION = [{ id: 3, vigente: true }];
const BLOQUE = { cursoHorarioId: 11, dia: 'LUNES', horaInicio: '19:00', horaFin: '19:45', horarioId: 501, aulaId: 4 };
const CURSO = { cursoId: 70, asignacionDocenteId: 900, paraleloGestionId: 20, carrera: 'SIS', materiaNombre: 'Mat', bloques: [BLOQUE] };
const GRILLA = {
  docenteNombre: 'Pérez Juan',
  franjas: [],
  courseSchedules: [CURSO],
  paresConflicto: [{ a: 1 }],
  paralelosInvolucrados: [
    { paraleloGestionId: 20, paraleloNombre: 'A', turno: 'TARDE' },
    { paraleloGestionId: 21, paraleloNombre: 'B', turno: 'TARDE' },
  ],
  solapeParaleloHorarioKeys: [],
  conflictHorarioIds: [501, 'x', 0],
  turnoEfectivo: 'TARDE',
};

const armarHttp = (over = {}) => {
  R.http.get.mockImplementation(async (url) => {
    if (String(url).includes('grilla-horario')) return over.paralelo ?? { success: true, data: {} };
    return over.docente ?? { success: true, data: GRILLA };
  });
};

const montar = async (espera = true) => {
  const hook = renderHook(() => useGestionHorariosConflictosState());
  if (espera) {
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    await waitFor(() => expect(hook.result.current.grilla).not.toBeNull());
  }
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  R.location = { state: null };
  R.search = new URLSearchParams('docenteId=7');
  R.gestiones = GESTION;
  R.pendientes = { data: null };
  R.bulk = { ejecutarBulk: vi.fn(), loading: false };
  R.live = new Set();
  R.bulkItems = { items: [], incomplete: false };
  R.estadoPg = 'BORRADOR';
  R.horarioResuelto = 600;
  R.pgSchedules = [{ ...CURSO, bloques: [{ ...BLOQUE }] }];
  R.app = { notification: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() } };
  R.handleErrorResponse.mockReturnValue({ error: 'Falla de red' });
  armarHttp();
});

describe('useGestionHorariosConflictosState - carga', () => {
  it('carga la grilla del docente en la gestión vigente y precarga sus paralelos', async () => {
    const { result } = await montar();
    expect(R.http.get).toHaveBeenCalledWith(expect.stringContaining('7'));
    await waitFor(() => expect(Object.keys(result.current.paraleloStates)).toEqual(['20', '21']));
    expect(result.current.docenteId).toBe(7);
    expect(result.current.gestionVigente).toMatchObject({ id: 3 });
    expect(result.current.docenteDraftSchedules).toHaveLength(1);
    expect(result.current.paraleloStates[20]).toMatchObject({ paraleloNombre: 'A', turno: 'TARDE', loading: false, error: null });
    expect(result.current.pageTitle).toBe('Conflictos de horario — Pérez Juan');
    expect(result.current.vistaOpciones.map((o) => o.key)).toEqual(['docente', '20', '21']);
    expect(result.current.vistaActivaLabel).toBe('Grilla del docente — Pérez Juan');
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Resolver conflictos');
  });

  it('sin conflictos en vivo usa los ids que reporta la API (filtrando inválidos)', async () => {
    const { result } = await montar();
    expect([...result.current.conflictHorarioIds]).toEqual([501]);
    expect(result.current.conflictoResuelto).toBe(false);
  });

  it('conflictos calculados en vivo tienen prioridad', async () => {
    R.live = new Set([900]);
    const { result } = await montar();
    expect([...result.current.conflictHorarioIds]).toEqual([900]);
  });

  it('sin docente en la URL no consulta y limpia el estado', async () => {
    R.search = new URLSearchParams();
    const { result } = renderHook(() => useGestionHorariosConflictosState());
    await act(async () => {});
    expect(R.http.get).not.toHaveBeenCalled();
    expect(result.current.docenteId).toBeNull();
    expect(result.current.pageTitle).toBe('Resolver conflictos de horario');
  });

  it('si hay un único docente con conflictos lo selecciona automáticamente', async () => {
    R.search = new URLSearchParams();
    R.pendientes = { data: { docentesConConflictosOperativos: [{ docenteId: 9 }] } };
    renderHook(() => useGestionHorariosConflictosState());
    await waitFor(() => expect(R.navigate).toHaveBeenCalledWith(expect.stringContaining('docenteId=9'), { replace: true }));
  });

  it('con varios docentes con conflictos no elige ninguno', async () => {
    R.search = new URLSearchParams();
    R.pendientes = { data: { docentesConConflictosOperativos: [{ docenteId: 9 }, { docenteId: 10 }] } };
    renderHook(() => useGestionHorariosConflictosState());
    await act(async () => {});
    expect(R.navigate).not.toHaveBeenCalled();
  });

  it('error de la API se expone y deja la grilla vacía', async () => {
    armarHttp({ docente: { success: false, error: 'sin acceso' } });
    const { result } = renderHook(() => useGestionHorariosConflictosState());
    await waitFor(() => expect(result.current.error).toBe('sin acceso'));
    expect(result.current.grilla).toBeNull();
  });

  it('una excepción de red pasa por el manejador de errores', async () => {
    R.http.get.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useGestionHorariosConflictosState());
    await waitFor(() => expect(result.current.error).toBe('Falla de red'));
  });

  it('el error al cargar un paralelo queda en su estado', async () => {
    armarHttp({ paralelo: { success: false, error: 'sin grilla' } });
    const { result } = await montar();
    await waitFor(() => expect(result.current.paraleloStates[20]?.error).toBe('sin grilla'));
  });

  it('vista por paralelo: expone su estado y reglas de edición', async () => {
    R.search = new URLSearchParams('docenteId=7&vista=pg-20');
    const { result } = await montar();
    await waitFor(() => expect(result.current.paraleloStates[20]?.serverSchedules).toBeTruthy());
    expect(result.current.isParaleloVista).toBe(true);
    expect(result.current.vistaActivaKey).toBe('20');
    expect(result.current.vistaActivaLabel).toBe('Grilla del paralelo — A');
    expect(result.current.horarioEditable).toBe(true);
    expect(result.current.planSemanalEditable).toBe(true);
    expect(result.current.turnoVistaActiva).toBe('TARDE');
    expect(result.current.draftSchedules).toHaveLength(1);
  });

  it('paralelo PUBLICADO: horario no editable pero plan semanal sí', async () => {
    R.estadoPg = 'PUBLICADO';
    R.search = new URLSearchParams('docenteId=7&vista=pg-20');
    const { result } = await montar();
    await waitFor(() => expect(result.current.paraleloStates[20]?.paraleloGestionEstado).toBe('PUBLICADO'));
    expect(result.current.horarioEditable).toBe(false);
    expect(result.current.planSemanalEditable).toBe(true);
  });

  it('una vista pg-N que ya no está involucrada vuelve a la vista docente', async () => {
    R.search = new URLSearchParams('docenteId=7&vista=pg-999');
    await montar();
    await waitFor(() => expect(R.setSearch).toHaveBeenCalled());
    const [params] = R.setSearch.mock.calls.at(-1);
    expect(params.get('vista')).toBeNull();
  });

  it('con vista inválida cae a la vista del docente', async () => {
    R.search = new URLSearchParams('docenteId=7&vista=pg-0');
    const { result } = await montar();
    expect(result.current.vistaModo).toBe('docente');
  });

  it('conflictoResuelto cuando no quedan pares, paralelos ni ids', async () => {
    armarHttp({ docente: { success: true, data: { ...GRILLA, paresConflicto: [], paralelosInvolucrados: [], conflictHorarioIds: [] } } });
    const { result } = await montar();
    expect(result.current.conflictoResuelto).toBe(true);
  });
});

describe('useGestionHorariosConflictosState - navegación y vistas', () => {
  it('setVistaModo escribe pg-N o limpia el parámetro', async () => {
    const { result } = await montar();
    act(() => result.current.setVistaModo(21));
    expect(R.setSearch.mock.calls.at(-1)[0].get('vista')).toBe('pg-21');
    expect(R.setSearch.mock.calls.at(-1)[1]).toEqual({ replace: true });
    act(() => result.current.setVistaModo('docente'));
    expect(R.setSearch.mock.calls.at(-1)[0].get('vista')).toBeNull();
  });

  it('setDocenteId navega a la URL del docente o limpia si es inválido', async () => {
    const { result } = await montar();
    act(() => result.current.setDocenteId(12));
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('docenteId=12'), { replace: true });
    act(() => result.current.setDocenteId(null));
    expect(R.setSearch).toHaveBeenLastCalledWith({}, { replace: true });
  });

  it('handleVolver respeta returnListPath y si no usa la gestión de horarios', async () => {
    R.location = { state: { returnListPath: '/volver' } };
    const { result, rerender } = await montar();
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/volver');
    R.location = { state: { returnListPath: '  ' } };
    rerender();
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('horarios'));
  });

  it('setDraftSchedules edita el borrador del docente o el del paralelo según la vista', async () => {
    const { result } = await montar();
    act(() => result.current.setDraftSchedules([]));
    expect(result.current.docenteDraftSchedules).toEqual([]);
    await waitFor(() => expect(result.current.paraleloStates[20]?.draftSchedules).toBeTruthy());
    act(() => result.current.setParaleloDraftSchedules(20, (prev) => [...prev, { cursoId: 1, bloques: [] }]));
    expect(result.current.paraleloStates[20].draftSchedules).toHaveLength(2);
    act(() => result.current.setParaleloDraftSchedules(999, []));
    act(() => result.current.setParaleloDraftSchedules('x', []));
    expect(result.current.paraleloStates[999]).toBeUndefined();
  });
});

describe('useGestionHorariosConflictosState - validatePlacement', () => {
  const mover = { cursoId: 70, cursoHorarioId: 11, targetDia: 'MARTES', targetSlotMinutes: 20 * 60 };

  it('colocación válida según el backend', async () => {
    R.validar.mockResolvedValue({ valido: true });
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r).toEqual({ ok: true });
    expect(R.validar).toHaveBeenCalledWith(expect.objectContaining({ asignacion_docente_id: 900, horario_id: 600, aula_id: 4, asignacion_horario_id: 11 }));
  });

  it('un bloque temporal no se excluye por id', async () => {
    R.validar.mockResolvedValue({ valido: true });
    R.http.get.mockImplementation(async () => ({
      success: true,
      data: { ...GRILLA, courseSchedules: [{ ...CURSO, bloques: [{ ...BLOQUE, cursoHorarioId: 'temp-1' }] }], paralelosInvolucrados: [] },
    }));
    const { result } = await montar();
    await act(async () => { await result.current.validatePlacement({ ...mover, cursoHorarioId: 'temp-1' }); });
    expect(R.validar).toHaveBeenCalledWith(expect.objectContaining({ asignacion_horario_id: null }));
  });

  it('sin asignación docente vigente rechaza con mensaje', async () => {
    armarHttp({ docente: { success: true, data: { ...GRILLA, courseSchedules: [{ ...CURSO, asignacionDocenteId: null, bloques: [BLOQUE] }] } } });
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/Sin asignación docente vigente/);
    expect(R.validar).not.toHaveBeenCalled();
  });

  it('franja sin horario en el catálogo del turno rechaza', async () => {
    R.horarioResuelto = null;
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toMatch(/Franja horaria no reconocida/);
  });

  it.each([
    ['DOCENTE', /intercambie con otro bloque del docente/],
    ['PARALELO', /Elija otra franja libre/],
    ['AULA', /Revise la asignación de aulas/],
  ])('conflicto de %s devuelve la guía correspondiente', async (tipo, patron) => {
    R.validar.mockResolvedValue({ valido: false, conflictos: [{ tipo, mensaje: 'Choque' }] });
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(patron);
    expect(r.message).toContain('Choque');
  });

  it('sin conflicto tipificado junta los mensajes o usa el genérico', async () => {
    const { result } = await montar();
    R.validar.mockResolvedValueOnce({ valido: false, conflictos: [{ tipo: 'OTRO', mensaje: 'Uno' }, { tipo: 'OTRO', mensaje: 'Dos' }] });
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toBe('Uno Dos');
    R.validar.mockResolvedValueOnce({ valido: false });
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toMatch(/sigue en conflicto/);
  });

  it('intercambio con el bloque de otra materia es válido sin consultar al backend', async () => {
    const otro = { cursoId: 71, asignacionDocenteId: 901, bloques: [{ cursoHorarioId: 12, dia: 'MARTES', horaInicio: '20:00', horaFin: '20:45', horarioId: 502 }] };
    armarHttp({ docente: { success: true, data: { ...GRILLA, courseSchedules: [CURSO, otro], paralelosInvolucrados: [] } } });
    const { result } = await montar();
    let r;
    await act(async () => {
      r = await result.current.validatePlacement({ ...mover, sourceDia: 'LUNES', sourceSlotMinutes: 19 * 60 });
    });
    expect(r).toEqual({ ok: true, swap: true });
    expect(R.validar).not.toHaveBeenCalled();
  });

  it('bloque inexistente se considera válido', async () => {
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.validatePlacement({ ...mover, cursoHorarioId: 'no-existe' }); });
    expect(r).toEqual({ ok: true });
  });
});

describe('useGestionHorariosConflictosState - guardar', () => {
  it('en vista docente pide elegir un paralelo', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.app.notification.info).toHaveBeenCalledWith(expect.objectContaining({ title: 'Edición por paralelo' }));
    expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();
  });

  const montarParalelo = async () => {
    const hook = await montar();
    await waitFor(() => expect(hook.result.current.paraleloStates[20]?.serverSchedules).toBeTruthy());
    return hook;
  };

  it('paralelo CERRADO no permite guardar', async () => {
    R.estadoPg = 'CERRADO';
    const { result } = await montarParalelo();
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan no editable' }));
  });

  it('sin bloques modificados informa «Sin cambios»', async () => {
    const { result } = await montarParalelo();
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.info).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sin cambios' }));
  });

  it('datos incompletos bloquean el guardado', async () => {
    R.bulkItems = { items: [{ op: 'create' }], incomplete: true };
    const { result } = await montarParalelo();
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Datos incompletos' }));
    expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();
  });

  it('PUBLICADO con solo altas/bajas avisa y no guarda; con reubicaciones guarda solo esas', async () => {
    R.estadoPg = 'PUBLICADO';
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    const { result } = await montarParalelo();
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paralelo publicado' }));
    expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();

    R.bulkItems = { items: [{ op: 'create' }, { op: 'UPDATE', id: 1 }], incomplete: false };
    R.bulk.ejecutarBulk.mockResolvedValue({ success: true });
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.bulk.ejecutarBulk).toHaveBeenCalledWith([{ op: 'UPDATE', id: 1 }]);
    expect(R.app.notification.info).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paralelo publicado' }));
  });

  it('guardado correcto recarga la grilla del docente y de los paralelos', async () => {
    R.bulkItems = { items: [{ op: 'update', id: 1 }], incomplete: false };
    R.bulk.ejecutarBulk.mockResolvedValue({ success: true });
    const { result } = await montarParalelo();
    const antes = R.http.get.mock.calls.length;
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Horarios actualizados' }));
    // docente + paralelo 20 + paralelo 21 (más las recargas disparadas por el efecto)
    expect(R.http.get.mock.calls.length - antes).toBeGreaterThanOrEqual(3);
  });

  it('error del backend se notifica', async () => {
    R.bulkItems = { items: [{ op: 'update', id: 1 }], incomplete: false };
    R.bulk.ejecutarBulk.mockResolvedValue({ success: false, error: 'Conflicto de aula' });
    const { result } = await montarParalelo();
    await act(async () => { await result.current.onRequestPersist(20); });
    expect(R.app.notification.error).toHaveBeenCalledWith({ title: 'Error al guardar', description: 'Conflicto de aula' });
  });

  it('refetch vuelve a pedir la grilla del docente', async () => {
    const { result } = await montar();
    const antes = R.http.get.mock.calls.length;
    await act(async () => { await result.current.refetch(); });
    expect(R.http.get.mock.calls.length).toBeGreaterThan(antes);
  });
});
