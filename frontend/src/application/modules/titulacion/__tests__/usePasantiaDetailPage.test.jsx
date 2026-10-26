import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const app = vi.hoisted(() => ({ api: { notification: { success: vi.fn(), error: vi.fn() } } }));
vi.mock('antd', async (orig) => {
  const actual = await orig();
  return { ...actual, App: Object.assign(({ children }) => children, { useApp: () => app.api }) };
});

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({ value: {} }));
vi.mock('@application-titulacion/pasantias/hooks/context/usePasantiaDetailContext', () => ({ usePasantiaDetailContext: () => ctx.value }));

import { usePasantiaDetailPage } from '../pasantias/hooks/state/usePasantiaDetailPage';

const ok = { success: true };
const fail = { success: false, error: 'Mal' };

const armar = (over = {}) => ({
  pasantiaId: 6,
  pasantia: { id: 6, tipo: 'PASANTIA', estado: 'SOLICITADA' },
  loading: false,
  error: null,
  refetch: vi.fn(),
  mutations: { transicionarEstado: vi.fn().mockResolvedValue(ok) },
  informes: { informes: [], loading: false, error: null, descargandoId: null, guardarInforme: vi.fn().mockResolvedValue(ok), descargarPdf: vi.fn().mockResolvedValue(ok) },
  seguimientos: { seguimientos: [], loading: false, error: null, descargandoId: null, guardarSeguimiento: vi.fn().mockResolvedValue(ok), descargarPdf: vi.fn().mockResolvedValue(ok) },
  ...over,
});
const montar = (over) => {
  ctx.value = armar(over);
  return renderHook(() => usePasantiaDetailPage());
};

beforeEach(() => {
  vi.clearAllMocks();
  router.location = { pathname: '/', state: null };
});

describe('usePasantiaDetailPage', () => {
  it('navegación', () => {
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'K' } };
    const { result } = montar();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/lista', { state: { menuSidebarKey: 'K' } });
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('6/editar'), { state: { returnListPath: '/lista', menuSidebarKey: 'K' } });
    const sin = montar({ pasantiaId: null });
    router.navigate.mockClear();
    act(() => sin.result.current.handleEditar());
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('sin informe viable no ofrece la transición positiva y avisa', () => {
    const { result } = montar();
    expect(result.current.transicionModal.transiciones).toEqual(['RECHAZADA']);
    expect(result.current.transicionModal.avisoInforme).toMatch(/En curso/);
    expect(result.current.informeVerificacion.informe).toBeNull();
    act(() => result.current.informeVerificacion.onDescargar());
    expect(ctx.value.informes.descargarPdf).not.toHaveBeenCalled();
  });

  it('con informe viable ofrece todas las transiciones y permite descargar', async () => {
    const informe = { id: 3, tipo: 'VERIFICACION_EMPRESA', resultado: 'VIABLE' };
    const { result } = montar({ informes: { ...armar().informes, informes: [informe], descargandoId: 3 } });
    expect(result.current.transicionModal.transiciones).toEqual(['EN_CURSO', 'RECHAZADA']);
    expect(result.current.transicionModal.avisoInforme).toBeNull();
    expect(result.current.informeVerificacion.descargando).toBe(true);
    act(() => result.current.informeVerificacion.onDescargar());
    expect(ctx.value.informes.descargarPdf).toHaveBeenCalledWith(6, informe);
  });

  it('convalidación usa su propio informe y aviso', () => {
    const { result } = montar({ pasantia: { id: 6, tipo: 'CONVALIDACION', estado: 'SOLICITADA' } });
    expect(result.current.transicionModal.avisoInforme).toMatch(/informe de convalidación/);
    const fin = montar({ pasantia: { id: 6, tipo: 'PASANTIA', estado: 'FINALIZADA' } });
    expect(fin.result.current.transicionModal.avisoInforme).toBeNull();
    const sinTipo = montar({ pasantia: null });
    expect(sinTipo.result.current.transicionModal.transiciones).toEqual([]);
  });

  it('transiciona el estado', async () => {
    const { result } = montar();
    act(() => result.current.transicionModal.abrir());
    expect(result.current.transicionModal.open).toBe(true);
    await act(async () => {
      await result.current.transicionModal.submit({});
      await result.current.transicionModal.submit({ estado: 'RECHAZADA', observaciones: 'x' });
    });
    expect(ctx.value.mutations.transicionarEstado).toHaveBeenCalledTimes(1);
    expect(ctx.value.mutations.transicionarEstado).toHaveBeenCalledWith(6, { estado: 'RECHAZADA', observaciones: 'x' });
    expect(result.current.transicionModal.open).toBe(false);
    ctx.value.mutations.transicionarEstado.mockResolvedValue(fail);
    await act(async () => {
      await result.current.transicionModal.submit({ estado: 'RECHAZADA' });
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.transicionModal.cerrar());
  });

  it('informes: abrir, guardar y descargar', async () => {
    const { result } = montar();
    act(() => result.current.informes.abrirNuevo());
    expect(result.current.informes.drawer.open).toBe(true);
    await act(async () => {
      await result.current.informes.guardar({ a: 1 });
    });
    expect(ctx.value.informes.guardarInforme).toHaveBeenCalledWith(6, null, { a: 1 });
    expect(result.current.informes.drawer.open).toBe(false);
    act(() => result.current.informes.abrirEditar({ id: 2 }));
    await act(async () => {
      await result.current.informes.guardar({ b: 1 });
    });
    expect(ctx.value.informes.guardarInforme).toHaveBeenLastCalledWith(6, 2, { b: 1 });
    ctx.value.informes.guardarInforme.mockResolvedValue(fail);
    ctx.value.informes.descargarPdf.mockResolvedValue(fail);
    await act(async () => {
      await result.current.informes.guardar({});
      await result.current.informes.descargar({ id: 2 });
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(2);
    act(() => result.current.informes.cerrarDrawer());
  });

  it('seguimientos: abrir, guardar y descargar', async () => {
    const { result } = montar();
    act(() => result.current.seguimientos.abrirNuevo());
    await act(async () => {
      await result.current.seguimientos.guardar({ a: 1 });
    });
    expect(ctx.value.seguimientos.guardarSeguimiento).toHaveBeenCalledWith(6, null, { a: 1 });
    act(() => result.current.seguimientos.abrirEditar({ id: 4 }));
    await act(async () => {
      await result.current.seguimientos.guardar({});
    });
    expect(ctx.value.seguimientos.guardarSeguimiento).toHaveBeenLastCalledWith(6, 4, {});
    ctx.value.seguimientos.guardarSeguimiento.mockResolvedValue(fail);
    ctx.value.seguimientos.descargarPdf.mockResolvedValue(fail);
    await act(async () => {
      await result.current.seguimientos.guardar({});
      await result.current.seguimientos.descargar({ id: 4 });
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(2);
    act(() => result.current.seguimientos.cerrarDrawer());
    expect(result.current.seguimientos.drawer.open).toBe(false);
  });
});
