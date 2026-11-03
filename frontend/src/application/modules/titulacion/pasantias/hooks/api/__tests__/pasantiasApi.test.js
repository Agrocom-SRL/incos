import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  pas: new Proxy({}, { get: (t, p) => (p in t ? t[p] : (t[p] = vi.fn())) }),
  downloadBlob: vi.fn(),
}));
vi.mock('@implementations/PasantiaRepository', () => ({ default: R.pas }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadBlob: R.downloadBlob }));

import { useGetMiPasantia } from '../useGetMiPasantia';
import { useGetPasantia } from '../useGetPasantia';
import { useGetPasantiaEmpresa } from '../useGetPasantiaEmpresa';
import { useInformesPasantiaApi } from '../useInformesPasantiaApi';
import { useSeguimientosPasantiaApi } from '../useSeguimientosPasantiaApi';
import { useMisPasantiasApi } from '../useMisPasantiasApi';
import { usePasantiaEmpresaMutations } from '../usePasantiaEmpresaMutations';
import { usePasantiaMutations } from '../usePasantiaMutations';
import { usePasantiasApi } from '../usePasantiasApi';
import { usePasantiasEmpresasApi } from '../usePasantiasEmpresasApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('consultas de pasantías', () => {
  it('mi pasantía: con trámite, sin trámite y con error', async () => {
    R.pas.obtenerMiPasantia.mockResolvedValueOnce({ success: true, data: { pasantia: { id: 1, tipo: 'PASANTIA' }, informes: [{ id: 1 }], seguimientos: [{ id: 2 }] } });
    const { result } = renderHook(() => useGetMiPasantia());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pasantia.id).toBe(1);
    expect(result.current.informes).toHaveLength(1);
    expect(result.current.seguimientos).toHaveLength(1);
    R.pas.obtenerMiPasantia.mockResolvedValueOnce({ success: true, data: {} });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.sinPasantia).toBe(true);
    R.pas.obtenerMiPasantia.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/trámite de pasantía/);
  });
  it('una pasantía y una empresa', async () => {
    const p = renderHook(() => useGetPasantia());
    let r;
    await act(async () => {
      r = await p.result.current.cargar(null);
    });
    expect(r.success).toBe(false);
    R.pas.obtenerPorId.mockResolvedValueOnce({ success: true, data: { pasantia: { id: 1 } } });
    await act(async () => {
      await p.result.current.cargar(1);
    });
    expect(p.result.current.pasantia.id).toBe(1);
    R.pas.obtenerPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await p.result.current.refetch(1);
    });
    expect(r.error).toMatch(/trámite de pasantía/);

    const e = renderHook(() => useGetPasantiaEmpresa());
    await act(async () => {
      r = await e.result.current.cargar('');
    });
    expect(r.success).toBe(false);
    R.pas.obtenerEmpresaPorId.mockResolvedValueOnce({ success: true, data: { pasantiaEmpresa: { id: 5 } } });
    await act(async () => {
      await e.result.current.cargar(5);
    });
    expect(e.result.current.empresa.id).toBe(5);
    R.pas.obtenerEmpresaPorId.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await e.result.current.refetch(5);
    });
    expect(r.error).toMatch(/empresa/);
  });
  it('listados', async () => {
    const l = renderHook(() => usePasantiasApi());
    R.pas.obtenerTodos.mockResolvedValueOnce({ success: true, data: { pasantias: [{ id: 1 }] }, pagination: { total: 1 } });
    expect(await l.result.current.fetch()).toMatchObject({ success: true, pagination: { total: 1 } });
    R.pas.obtenerTodos.mockResolvedValueOnce({ success: false });
    expect((await l.result.current.fetch()).error).toMatch(/trámites/);

    R.pas.obtenerMisPasantias.mockResolvedValueOnce({ success: true, data: [{ id: 1 }] });
    const m = renderHook(() => useMisPasantiasApi());
    await waitFor(() => expect(m.result.current.loading).toBe(false));
    expect(m.result.current.pasantias).toHaveLength(1);
    R.pas.obtenerMisPasantias.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await m.result.current.refetch();
    });
    expect(m.result.current.error).toMatch(/supervisadas/);
  });
  it('empresas: opciones solo de activas', async () => {
    R.pas.obtenerEmpresas.mockResolvedValue({ success: true, data: { pasantiasEmpresas: [
      { id: 1, nombre: 'Razón SRL', nombreComercial: 'Comercial', nit: '123' },
      { id: 2, nombre: 'Solo', activo: false },
      { id: 3, nombre: 'Simple' },
    ] } });
    const { result } = renderHook(() => usePasantiasEmpresasApi({ incluirInactivos: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(R.pas.obtenerEmpresas).toHaveBeenCalledWith({ params: { limit: 1000, incluirInactivos: true } });
    expect(result.current.options).toEqual([{ value: 1, label: 'Comercial · Razón SRL · NIT 123' }, { value: 3, label: 'Simple' }]);
    R.pas.obtenerEmpresas.mockResolvedValue({ success: false });
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toMatch(/empresas/);
  });
});

describe('informes y seguimientos', () => {
  it('informes: carga, guardado y PDF', async () => {
    const { result } = renderHook(() => useInformesPasantiaApi());
    let r;
    await act(async () => {
      r = await result.current.cargar(null);
    });
    expect(r.success).toBe(false);
    R.pas.obtenerInformes.mockResolvedValueOnce({ success: true, data: { informes: [{ id: 1 }] } });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.informes).toHaveLength(1);
    R.pas.obtenerInformes.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.error).toMatch(/informes/);
    result.current.guardarInforme(1, 2, { a: 1 });
    result.current.guardarInforme(1, null, { b: 1 });
    expect(R.pas.actualizarInforme).toHaveBeenCalledWith(1, 2, { a: 1 });
    expect(R.pas.crearInforme).toHaveBeenCalledWith(1, { b: 1 });
    const blob = new Blob(['x']);
    R.pas.descargarInformePdf.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.descargarPdf(1, { id: 2, nombreArchivo: 'i.pdf' });
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'i.pdf');
    R.pas.descargarInformePdf.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.descargarPdf(1, { id: 2 });
    });
    expect(r.error).toMatch(/PDF del informe/);
  });
  it('seguimientos: carga, guardado y PDF', async () => {
    const { result } = renderHook(() => useSeguimientosPasantiaApi());
    let r;
    await act(async () => {
      r = await result.current.cargar(null);
    });
    expect(r.success).toBe(false);
    R.pas.obtenerSeguimientos.mockResolvedValueOnce({ success: true, data: [{ id: 1 }] });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.seguimientos).toHaveLength(1);
    R.pas.obtenerSeguimientos.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current.error).toMatch(/seguimientos/);
    result.current.guardarSeguimiento(1, 2, { a: 1 });
    result.current.guardarSeguimiento(1, undefined, { b: 1 });
    expect(R.pas.actualizarSeguimiento).toHaveBeenCalledWith(1, 2, { a: 1 });
    expect(R.pas.crearSeguimiento).toHaveBeenCalledWith(1, { b: 1 });
    const blob = new Blob(['x']);
    R.pas.descargarSeguimientoPdf.mockResolvedValueOnce({ success: true, blob });
    await act(async () => {
      await result.current.descargarPdf(1, { id: 2 });
    });
    expect(R.downloadBlob).toHaveBeenCalledWith(blob, 'seguimiento_pasantia.pdf');
    R.pas.descargarSeguimientoPdf.mockResolvedValueOnce({ success: false });
    await act(async () => {
      r = await result.current.descargarPdf(1, { id: 2 });
    });
    expect(r.error).toMatch(/hoja de seguimiento/);
  });
});

describe('mutaciones', () => {
  it('pasantías', async () => {
    const { result } = renderHook(() => usePasantiaMutations());
    await act(async () => {
      await result.current.guardarPasantia({ id: 1, payload: { a: 1 } });
      await result.current.guardarPasantia({ payload: { b: 1 } });
    });
    expect(R.pas.actualizar).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.pas.crear).toHaveBeenCalledWith({ b: 1 });
    result.current.eliminarPasantia(1);
    result.current.transicionarEstado(1, { estado: 'EN_CURSO' });
    expect(R.pas.eliminar).toHaveBeenCalledWith(1);
    expect(R.pas.transicionar).toHaveBeenCalledWith(1, { estado: 'EN_CURSO' });
  });
  it('empresas', async () => {
    const { result } = renderHook(() => usePasantiaEmpresaMutations());
    await act(async () => {
      await result.current.guardarEmpresa({ empresaId: 1, payload: { a: 1 } });
      await result.current.guardarEmpresa({ payload: { b: 1 } });
    });
    expect(R.pas.actualizarEmpresa).toHaveBeenCalledWith(1, { a: 1 });
    expect(R.pas.crearEmpresa).toHaveBeenCalledWith({ b: 1 });
    result.current.cambiarEstadoEmpresa(1, false);
    result.current.eliminarEmpresa(1);
    expect(R.pas.cambiarEstadoEmpresa).toHaveBeenCalledWith(1, false);
    expect(R.pas.eliminarEmpresa).toHaveBeenCalledWith(1);
  });
});
