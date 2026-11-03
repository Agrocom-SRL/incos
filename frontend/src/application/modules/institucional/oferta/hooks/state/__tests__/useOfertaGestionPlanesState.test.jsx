import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  params: { gestionId: '1' },
  navigate: vi.fn(),
  location: { state: null },
  search: new URLSearchParams(),
  setSearch: vi.fn(),
  app: null,
  api: null,
  msg: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return { ...real, message: Object.assign(real.message, R.msg) };
});
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => R.params,
  useNavigate: () => R.navigate,
  useLocation: () => R.location,
  useSearchParams: () => [R.search, R.setSearch],
}));
vi.mock('../../api/useOfertaAcademicaApi.js', () => ({ useOfertaAcademicaApi: () => R.api }));

import { useOfertaGestionPlanesState } from '../useOfertaGestionPlanesState';

const ok = (data) => ({ success: true, data });
const PLANES = [
  { id: 10, carreraCodigo: 'SIS', planResolucion: 'RM 1' },
  { id: 11, carreraCodigo: 'CON', planResolucion: 'RM 2' },
];
const GESTIONES = [{ id: 1, codigo: '2026', vigente: true }, { id: 2, codigo: '2025', vigente: false }];

const armar = (over = {}) => {
  R.api = {
    loading: false,
    error: null,
    fetchGestionesSilent: vi.fn().mockResolvedValue(ok({ gestiones: GESTIONES })),
    fetchPlanesHabilitadosSilent: vi.fn().mockResolvedValue(ok({ planesHabilitados: PLANES })),
    fetchParalelosGestionSilent: vi.fn().mockResolvedValue(ok({ paralelosGestion: [{ id: 100, paraleloNombre: 'A', ofertaActual: 0 }] })),
    generarParalelosGestionSilent: vi.fn().mockResolvedValue(ok({ resumen: { creados: 2 } })),
    generarOfertaSilent: vi.fn().mockResolvedValue(ok({ resumen: { creados: 5 } })),
    fetchCoberturaDocente: vi.fn().mockResolvedValue(ok({})),
    updateParaleloGestionEstado: vi.fn().mockResolvedValue({ success: true }),
    ...over,
  };
};

const montar = async () => {
  const hook = renderHook(() => useOfertaGestionPlanesState());
  await waitFor(() => expect(hook.result.current.planesHabilitadosLoaded).toBe(true));
  await waitFor(() => expect(hook.result.current.paralelosLoading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  R.params = { gestionId: '1' };
  R.location = { state: null };
  R.search = new URLSearchParams('plan=10');
  R.app = {
    modal: { confirm: vi.fn() },
    notification: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  };
  armar();
});

describe('useOfertaGestionPlanesState - carga', () => {
  it('carga gestiones, planes habilitados y paralelos del plan activo con su cobertura', async () => {
    const { result } = await montar();
    expect(R.api.fetchPlanesHabilitadosSilent).toHaveBeenCalledWith(1);
    expect(R.api.fetchParalelosGestionSilent).toHaveBeenCalledWith(10);
    expect(R.api.fetchCoberturaDocente).toHaveBeenCalledWith(100);
    expect(result.current.gestionSeleccionada).toMatchObject({ id: 1 });
    expect(result.current.esGestionOperativa).toBe(true);
    expect(result.current.puedeEditarOferta).toBe(true);
    expect(result.current.planSeleccionado.id).toBe(10);
    expect(result.current.activePlanKey).toBe('10');
    expect(result.current.paralelosByPlanId[10]).toHaveLength(1);
    expect(result.current.coberturaByParaleloId).toHaveProperty('100');
    expect(result.current.tabItems.map((t) => t.key)).toEqual(['10', '11']);
    expect(result.current.tabItems[0].label).toBe('SIS · RM 1');
    expect(result.current.gestionContextAlert).toBeNull();
    expect(result.current.kpis).toMatchObject({ planesHabilitados: 2, gestionVigente: 1 });
    expect(result.current.breadcrumbItems.at(-1).title).toBe('2026');
    expect(result.current.pageTitle).toBe('Planes vigentes');
  });

  it('plan inexistente en la URL cae al primero y corrige el parámetro conservando el state', async () => {
    R.search = new URLSearchParams('plan=999');
    R.location = { state: { returnListPath: '/pasadas' } };
    const { result } = await montar();
    expect(result.current.planSeleccionado.id).toBe(10);
    expect(R.setSearch).toHaveBeenCalledWith({ plan: '10' }, { replace: true, state: { returnListPath: '/pasadas' } });
  });

  it('onTabChange cambia el plan sin perder el state de retorno', async () => {
    R.location = { state: { returnListPath: '/pasadas' } };
    const { result } = await montar();
    act(() => result.current.onTabChange(11));
    expect(R.setSearch).toHaveBeenLastCalledWith({ plan: '11' }, { replace: true, state: { returnListPath: '/pasadas' } });
  });

  it('gestión vigente sin planes habilitados redirige al dashboard', async () => {
    armar({ fetchPlanesHabilitadosSilent: vi.fn().mockResolvedValue(ok({ planesHabilitados: [] })) });
    const { result } = await montar();
    expect(result.current.sinPlanesHabilitados).toBe(true);
    await waitFor(() => expect(R.navigate).toHaveBeenCalledWith(expect.any(String), { replace: true }));
  });

  it('gestión histórica es solo consulta y ofrece ir a la vigente', async () => {
    R.params = { gestionId: '2' };
    const { result } = await montar();
    expect(result.current.esGestionOperativa).toBe(false);
    expect(result.current.gestionContextAlert).toMatchObject({ type: 'info', showIrGestionVigente: true });
    expect(result.current.gestionContextAlert.description).toContain('2026');
    act(() => result.current.navigateGestionVigente());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('/gestiones/1/planes'));
  });

  it('gestión histórica sin planes muestra la advertencia', async () => {
    R.params = { gestionId: '2' };
    armar({ fetchPlanesHabilitadosSilent: vi.fn().mockResolvedValue({ success: false }) });
    const { result } = await montar();
    expect(result.current.gestionContextAlert).toMatchObject({ type: 'warning', title: 'Gestión histórica sin planes habilitados' });
    expect(R.navigate).not.toHaveBeenCalled();
  });

  it('sin gestión vigente navegar a la vigente cae al dashboard', async () => {
    R.params = { gestionId: '2' };
    armar({ fetchGestionesSilent: vi.fn().mockResolvedValue(ok({ gestiones: [GESTIONES[1]] })) });
    const { result } = await montar();
    expect(result.current.gestionContextAlert.showIrGestionVigente).toBe(false);
    act(() => result.current.navigateGestionVigente());
    expect(R.navigate).toHaveBeenLastCalledWith(expect.not.stringContaining('/gestiones/'));
  });

  it('gestionId inválido no consulta planes', async () => {
    R.params = { gestionId: 'abc' };
    const { result } = renderHook(() => useOfertaGestionPlanesState());
    await waitFor(() => expect(R.api.fetchGestionesSilent).toHaveBeenCalled());
    expect(R.api.fetchPlanesHabilitadosSilent).not.toHaveBeenCalled();
    expect(result.current.planesLoading).toBe(true);
  });

  it('navegación: volver usa el origen, detalle y dashboard', async () => {
    R.location = { state: { returnListPath: '/pasadas' } };
    const { result } = await montar();
    act(() => result.current.navigateBack());
    expect(R.navigate).toHaveBeenLastCalledWith('/pasadas');
    act(() => result.current.onNavigateDetalle(55));
    expect(R.navigate).toHaveBeenLastCalledWith(expect.stringContaining('/paralelo/55'));
    act(() => result.current.navigateDashboard());
    expect(R.navigate).toHaveBeenCalledTimes(3);
  });

  it('apiLoading refleja la mutación en curso', async () => {
    R.api.loading = true;
    const { result } = await montar();
    expect(result.current.apiLoading).toBe(true);
  });
});

describe('useOfertaGestionPlanesState - generar oferta', () => {
  it('genera paralelos y cursos en cada plan y avisa del resultado', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.onGenerarParalelos(); });
    expect(R.api.generarParalelosGestionSilent).toHaveBeenCalledTimes(2);
    expect(R.api.generarOfertaSilent).toHaveBeenCalledWith(100);
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Oferta preparada en la gestión',
      description: expect.stringContaining('4 paralelo(s) nuevos en 2 planes'),
    }));
    expect(result.current.generandoParalelos).toBe(false);
  });

  it('todo al día avisa «Oferta al día»', async () => {
    armar({
      generarParalelosGestionSilent: vi.fn().mockResolvedValue(ok({ resumen: { creados: 0 } })),
      fetchParalelosGestionSilent: vi.fn().mockResolvedValue(ok({ paralelosGestion: [{ id: 100, ofertaActual: 3 }] })),
    });
    const { result } = await montar();
    await act(async () => { await result.current.onGenerarParalelos(); });
    expect(R.api.generarOfertaSilent).not.toHaveBeenCalled();
    expect(R.app.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Oferta al día' }));
  });

  it('si todos los planes fallan advierte y no marca éxito', async () => {
    armar({ generarParalelosGestionSilent: vi.fn().mockResolvedValue({ success: false }) });
    const { result } = await montar();
    await act(async () => { await result.current.onGenerarParalelos(); });
    expect(R.app.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se generó la oferta' }));
    expect(R.app.notification.success).not.toHaveBeenCalled();
  });

  it('errores parciales se listan sin repetir', async () => {
    armar({
      generarOfertaSilent: vi.fn().mockResolvedValue({ success: false }),
      generarParalelosGestionSilent: vi.fn().mockResolvedValue(ok({ resumen: { creados: 1 } })),
    });
    const { result } = await montar();
    await act(async () => { await result.current.onGenerarParalelos(); });
    expect(R.app.notification.warning).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Algunos ítems no se procesaron', description: 'A',
    }));
  });

  it('en gestión histórica no genera nada', async () => {
    R.params = { gestionId: '2' };
    const { result } = await montar();
    await act(async () => { await result.current.onGenerarParalelos(); });
    expect(R.api.generarParalelosGestionSilent).not.toHaveBeenCalled();
  });
});

describe('useOfertaGestionPlanesState - habilitar / inhabilitar', () => {
  it('inhabilitar pide confirmación y al aceptar cierra el paralelo y refresca el plan', async () => {
    const { result } = await montar();
    act(() => result.current.onInhabilitarParalelo(100, 10, 'A'));
    const cfg = R.app.modal.confirm.mock.calls[0][0];
    expect(cfg.title).toBe('Inhabilitar oferta del paralelo');
    expect(cfg.content).toContain('A');
    const llamadas = R.api.fetchParalelosGestionSilent.mock.calls.length;
    await act(async () => { await cfg.onOk(); });
    expect(R.api.updateParaleloGestionEstado).toHaveBeenCalledWith(100, 'CERRADO');
    expect(R.msg.success).toHaveBeenCalledWith('Oferta del paralelo inhabilitada');
    expect(R.api.fetchParalelosGestionSilent.mock.calls.length).toBeGreaterThan(llamadas);
    expect(result.current.inhabilitandoParaleloId).toBeNull();
  });

  it('habilitar sin plan recarga todos los planes', async () => {
    const { result } = await montar();
    act(() => result.current.onHabilitarParalelo(100, null, null));
    const cfg = R.app.modal.confirm.mock.calls[0][0];
    expect(cfg.content).toContain('este paralelo');
    const llamadas = R.api.fetchParalelosGestionSilent.mock.calls.length;
    await act(async () => { await cfg.onOk(); });
    expect(R.api.updateParaleloGestionEstado).toHaveBeenCalledWith(100, 'BORRADOR');
    expect(R.api.fetchParalelosGestionSilent.mock.calls.length - llamadas).toBe(2);
  });

  it('si la API falla muestra el error y no refresca', async () => {
    R.api.updateParaleloGestionEstado.mockResolvedValue({ success: false, error: 'No permitido' });
    const { result } = await montar();
    act(() => result.current.onInhabilitarParalelo(100, 10, 'A'));
    const llamadas = R.api.fetchParalelosGestionSilent.mock.calls.length;
    await act(async () => { await R.app.modal.confirm.mock.calls[0][0].onOk(); });
    expect(R.msg.error).toHaveBeenCalledWith('No permitido');
    expect(R.api.fetchParalelosGestionSilent.mock.calls.length).toBe(llamadas);
  });

  it('en gestión histórica no abre confirmaciones', async () => {
    R.params = { gestionId: '2' };
    const { result } = await montar();
    act(() => result.current.onInhabilitarParalelo(100, 10, 'A'));
    act(() => result.current.onHabilitarParalelo(100, 10, 'A'));
    expect(R.app.modal.confirm).not.toHaveBeenCalled();
  });
});
