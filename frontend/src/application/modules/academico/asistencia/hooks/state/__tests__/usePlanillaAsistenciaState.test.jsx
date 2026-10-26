import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const app = vi.hoisted(() => ({ api: { notification: { success: vi.fn(), error: vi.fn() } } }));
vi.mock('antd', async (orig) => {
  const actual = await orig();
  return { ...actual, App: Object.assign(({ children }) => children, { useApp: () => app.api }) };
});

const router = vi.hoisted(() => ({ params: { asignacionId: '5' }, search: new URLSearchParams(), setSearch: vi.fn() }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useSearchParams: () => [router.search, router.setSearch],
}));

const auth = vi.hoisted(() => ({ puede: true }));
vi.mock('@application-auth', async (orig) => ({ ...(await orig()), useAuth: () => ({ hasPermiso: () => auth.puede }) }));

const api = vi.hoisted(() => ({
  planilla: {}, calendario: {}, bulk: {}, cierre: {}, sesion: {},
}));
vi.mock('@application-academico/asistencia/hooks/api/usePlanillaAsistenciaApi.js', () => ({ usePlanillaAsistenciaApi: () => api.planilla }));
vi.mock('@application-academico/asistencia/hooks/api/useCalendarioAsistenciaApi.js', () => ({ useCalendarioAsistenciaApi: () => api.calendario }));
vi.mock('@application-academico/asistencia/hooks/api/useBulkAsistenciaApi.js', () => ({ useBulkAsistenciaApi: () => api.bulk }));
vi.mock('@application-academico/asistencia/hooks/api/useRegistroCierreApi.js', () => ({ useRegistroCierreApi: () => api.cierre }));
vi.mock('@application-academico/asistencia/hooks/api/useSesionEspecialApi.js', () => ({ useSesionEspecialApi: () => api.sesion }));

import { usePlanillaAsistenciaState } from '../usePlanillaAsistenciaState';

const DIAS = [
  { fechaClase: '2026-05-04', esDiaClase: true },
  { fechaClase: '2026-05-05', esDiaClase: true, neutro: 'FERIADO' },
  { fechaClase: '2026-05-06', esDiaClase: true, esFuturo: true },
];

const armar = (over = {}) => {
  api.planilla = {
    planilla: { filas: [{ id: 1 }], dias: DIAS, diasValidos: [1], rango: { desde: '2026-05-04', hasta: '2026-05-09' }, registroEstado: 'ABIERTO', curso: { id: 5 } },
    loading: false, error: null, fetch: vi.fn().mockResolvedValue({ success: true }), ...over.planilla,
  };
  api.calendario = {
    calendario: { rango: { desde: '2026-05-01', hasta: '2026-06-30' }, bimestre: 2, anioCalendario: 2026, hoy: '2026-05-06', horario: [1], resumen: { x: 1 }, curso: { id: 5 }, bimestreNombre: 'B2', bimestreColor: '#fff', gestion: { id: 1 } },
    fetch: vi.fn(), ...over.calendario,
  };
  api.bulk = { guardar: vi.fn().mockResolvedValue({ success: true }), ...over.bulk };
  api.cierre = { cerrar: vi.fn().mockResolvedValue({ success: true }), reabrir: vi.fn().mockResolvedValue({ success: true }), procesando: false, ...over.cierre };
  api.sesion = { crear: vi.fn().mockResolvedValue({ success: true }), creando: false, ...over.sesion };
};

beforeEach(() => {
  vi.clearAllMocks();
  router.params = { asignacionId: '5' };
  router.search = new URLSearchParams();
  auth.puede = true;
  armar();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('usePlanillaAsistenciaState', () => {
  it('carga calendario y planilla de la asignación y expone datos derivados', () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    expect(api.calendario.fetch).toHaveBeenCalledWith('5', {});
    expect(api.planilla.fetch).toHaveBeenCalledWith('5', { desde: null, hasta: null });
    expect(result.current).toMatchObject({ asignacionId: '5', bimestre: 2, bimestreNombre: 'B2', registroCerrado: false, esSemanaActual: true, puedeEditar: true, hoy: '2026-05-06' });
    expect(result.current.rangoGestion).toEqual({ desde: '2026-01-01', hasta: '2026-12-31' });
    expect(result.current.semanaPrev).toEqual({ desde: '2026-04-27', hasta: '2026-05-02' });
    expect(result.current.semanaSig).toEqual({ desde: '2026-05-11', hasta: '2026-05-16' });
    expect(result.current.breadcrumbItems).toBeTruthy();
    expect(result.current.estadoCelda(1, '2026-05-04', undefined)).toBe('PRESENTE');
  });

  it('sin asignación no consulta; la query determina la semana', () => {
    router.params = {};
    router.search = new URLSearchParams('desde=2026-05-11&hasta=2026-05-16');
    api.planilla.planilla = null;
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    expect(api.planilla.fetch).not.toHaveBeenCalled();
    expect(result.current.rangoSemana).toEqual({ desde: '2026-05-11', hasta: '2026-05-16' });
    expect(result.current.esSemanaActual).toBe(false);
    expect(result.current.registroEstado).toBe('ABIERTO');
  });

  it('alterna marcas y las descarta; respeta permisos y celdas no editables', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    act(() => result.current.toggleCelda(1, '2026-05-04', undefined));
    expect(result.current.hayCambios).toBe(true);
    expect(result.current.estadoCelda(1, '2026-05-04', undefined)).toBe('AUSENTE');
    act(() => result.current.toggleCelda(1, '2026-05-04', undefined));
    expect(result.current.hayCambios).toBe(false);
    act(() => result.current.toggleCelda(1, '2026-05-05', undefined));
    act(() => result.current.toggleCelda(1, '2026-05-06', undefined));
    act(() => result.current.toggleCelda(1, '2026-05-09', undefined));
    expect(result.current.hayCambios).toBe(false);
    act(() => result.current.toggleCelda(1, '2026-05-04', undefined));
    act(() => result.current.descartarCambios());
    expect(result.current.hayCambios).toBe(false);
    auth.puede = false;
    const sin = renderHook(() => usePlanillaAsistenciaState());
    act(() => sin.result.current.toggleCelda(1, '2026-05-04', undefined));
    expect(sin.result.current.hayCambios).toBe(false);
  });

  it('autoguarda tras el retardo y limpia lo enviado', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    act(() => result.current.toggleCelda(7, '2026-05-04', undefined));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(api.bulk.guardar).toHaveBeenCalledWith('5', { dias: [{ fechaClase: '2026-05-04', marcas: [{ matriculaMateriaId: 7, estado: 'AUSENTE' }] }] });
    expect(result.current.hayCambios).toBe(false);
    expect(api.calendario.fetch).toHaveBeenCalledTimes(2);
  });

  it('si el guardado falla, conserva los cambios y reintenta con retroceso', async () => {
    vi.useFakeTimers();
    api.bulk.guardar.mockResolvedValue({ success: false });
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    act(() => result.current.toggleCelda(7, '2026-05-04', undefined));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(result.current.hayCambios).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2600);
    });
    expect(api.bulk.guardar).toHaveBeenCalledTimes(2);
    api.bulk.guardar.mockRejectedValue(new Error('Red'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(api.bulk.guardar).toHaveBeenCalledTimes(3);
  });

  it('cerrar día: guarda pendientes antes, y avisa si falla', async () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    let ok;
    await act(async () => {
      ok = await result.current.cerrarDia('2026-05-04');
    });
    expect(ok).toBe(true);
    expect(api.cierre.cerrar).toHaveBeenCalledWith('5', { bimestre: 2, fecha: '2026-05-04' });
    expect(app.api.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Día cerrado' }));
    act(() => result.current.toggleCelda(7, '2026-05-04', undefined));
    await act(async () => {
      ok = await result.current.cerrarDia('2026-05-04');
    });
    expect(api.bulk.guardar).toHaveBeenCalled();
    api.cierre.cerrar.mockResolvedValue({ success: false, error: 'No' });
    await act(async () => {
      ok = await result.current.cerrarDia('2026-05-04');
    });
    expect(ok).toBe(false);
    api.bulk.guardar.mockResolvedValue({ success: false });
    act(() => result.current.toggleCelda(8, '2026-05-04', undefined));
    await act(async () => {
      ok = await result.current.cerrarDia('2026-05-04');
    });
    expect(ok).toBe(false);
    expect(app.api.notification.error).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se cerró el día' }));
  });

  it('reabrir día activa el modo corrección', async () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    let ok;
    await act(async () => {
      ok = await result.current.reabrirDia('2026-05-04');
    });
    expect(ok).toBe(true);
    expect(result.current.modoCorreccion).toBe(true);
    // en modo corrección, una falta pasa por atraso
    act(() => result.current.toggleCelda(1, '2026-05-04', 'AUSENTE'));
    expect(result.current.estadoCelda(1, '2026-05-04', 'AUSENTE')).toBe('TARDANZA');
    api.cierre.reabrir.mockResolvedValue({ success: false });
    await act(async () => {
      ok = await result.current.reabrirDia('2026-05-04');
    });
    expect(ok).toBe(false);
    api.bulk.guardar.mockResolvedValue({ success: false });
    act(() => result.current.toggleCelda(9, '2026-05-04', undefined));
    await act(async () => {
      ok = await result.current.reabrirDia('2026-05-04');
    });
    expect(ok).toBe(false);
  });

  it('habilita fechas especiales', async () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    let ok;
    await act(async () => {
      ok = await result.current.habilitarFechaEspecial({ fecha: '2026-05-13', motivo: 'm' });
    });
    expect(ok).toBe(true);
    expect(router.setSearch).toHaveBeenCalledWith({ desde: '2026-05-11', hasta: '2026-05-16' });
    await act(async () => {
      await result.current.habilitarFechaEspecial({ motivo: 'm' });
    });
    expect(api.planilla.fetch).toHaveBeenCalledTimes(2);
    api.sesion.crear.mockResolvedValue({ success: false, error: 'No' });
    await act(async () => {
      ok = await result.current.habilitarFechaEspecial({ fecha: '2026-05-13' });
    });
    expect(ok).toBe(false);
  });

  it('navega entre semanas y a fechas', () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    act(() => result.current.irSemanaAnterior());
    expect(router.setSearch).toHaveBeenLastCalledWith({ desde: '2026-04-27', hasta: '2026-05-02' });
    act(() => result.current.irSemanaSiguiente());
    expect(router.setSearch).toHaveBeenLastCalledWith({ desde: '2026-05-11', hasta: '2026-05-16' });
    act(() => result.current.irHoy());
    expect(router.setSearch).toHaveBeenLastCalledWith({ desde: '2026-05-04', hasta: '2026-05-09' });
    act(() => result.current.irAFecha(null));
    const n = router.setSearch.mock.calls.length;
    act(() => result.current.irAFecha('2026-05-20'));
    expect(router.setSearch.mock.calls.length).toBe(n + 1);
  });

  it('flushPendientes sin cambios es inmediato', async () => {
    const { result } = renderHook(() => usePlanillaAsistenciaState());
    await expect(result.current.flushPendientes()).resolves.toBe(true);
    act(() => result.current.toggleCelda(7, '2026-05-04', undefined));
    await act(async () => {
      await result.current.flushPendientes();
    });
    expect(api.bulk.guardar).toHaveBeenCalledTimes(1);
  });
});
