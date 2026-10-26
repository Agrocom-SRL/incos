import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/finanzas/ingresos', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({ config: {}, cobrar: {}, ingresos: {}, detalle: {} }));
vi.mock('@application-finanzas/hooks/context/useConfigPagosContext', () => ({ useConfigPagosContext: () => ctx.config }));
vi.mock('@application-finanzas/hooks/context/useCuentasPorCobrarContext', () => ({ useCuentasPorCobrarContext: () => ctx.cobrar }));
vi.mock('@application-finanzas/hooks/context/useIngresosListContext', () => ({ useIngresosListContext: () => ctx.ingresos }));
vi.mock('@application-finanzas/hooks/context/usePagosDetailContext', () => ({ usePagosDetailContext: () => ctx.detalle }));

import { useCuentaForm } from '../useCuentaForm';
import { useMetodoForm } from '../useMetodoForm';
import { useMetodoDetailPage } from '../useMetodoDetailPage';
import { useCuentasPorCobrarPage } from '../useCuentasPorCobrarPage';
import { useIngresosListPage } from '../useIngresosListPage';
import { usePagosDetailPage } from '../usePagosDetailPage';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/finanzas/ingresos', state: null };
  ctx.config = {
    metodos: [{ id: 1, nombre: 'QR' }],
    bancos: [{ id: 2, nombre: 'BNB', metodoPagoId: 1 }],
    cuentas: [{ id: 3, nombreTitular: 'Ana', metodoPagoId: 1, numeroCelular: '7' }],
    loading: false, saving: false, error: null,
    refetch: vi.fn(), guardarCuenta: vi.fn(), actualizarMetodoPago: vi.fn(),
  };
});

describe('useCuentaForm', () => {
  it('alta: arma secciones y condiciona celular/QR', async () => {
    const { result } = renderHook(() => useCuentaForm('create'), { wrapper });
    const nombres = (k) => result.current.formSections[k].fields.map((f) => f.name);
    expect(nombres('datosCuenta')).not.toContain('numeroCelular');
    expect(nombres('qrCuenta')).toEqual(['qrImagenUrl', 'tieneQr']);
    expect(result.current.pageTitle).toBe('Nueva cuenta de pago');
    expect(result.current.formSections.datosCuenta.fields.find((f) => f.name === 'bancoId').options).toEqual([{ value: 2, label: 'BNB' }]);
  });
  it('alta: guarda con QR y navega al detalle', async () => {
    ctx.config.guardarCuenta.mockResolvedValue({ success: true, data: { cuentaPago: { id: 8 } } });
    const { result } = renderHook(() => useCuentaForm('create'), { wrapper });
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombreTitular: ' Ana ' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.config.guardarCuenta).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ nombre_titular: 'Ana' }) });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('8'), { replace: true });
  });
  it('edición: carga la cuenta y agrega el estado activo', async () => {
    router.params = { id: '3' };
    const { result } = renderHook(() => useCuentaForm('edit'), { wrapper });
    expect(result.current.cuentaActual.nombreTitular).toBe('Ana');
    await waitFor(() => expect(result.current.form.getFieldValue('nombreTitular')).toBe('Ana'));
    expect(result.current.formSections.datosCuenta.fields.map((f) => f.name)).toContain('activo');
  });
  it('edición: cuenta inexistente / id inválido y errores', async () => {
    router.params = { id: '99' };
    const a = renderHook(() => useCuentaForm('edit'), { wrapper });
    expect(a.result.current.error).toBe('No se pudo cargar la cuenta');
    router.params = { id: 'x' };
    expect(renderHook(() => useCuentaForm('edit'), { wrapper }).result.current.isInvalidEditId).toBe(true);
    ctx.config.guardarCuenta.mockResolvedValue({ success: false });
    const b = renderHook(() => useCuentaForm('create'), { wrapper });
    b.result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await b.result.current.handleSubmit();
    });
    expect(b.result.current.error).toBe('No se pudo guardar la cuenta');
    b.result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await b.result.current.handleSubmit();
    });
    expect(b.result.current.error).toBe('Revise los campos obligatorios');
    ctx.config.guardarCuenta.mockResolvedValue({ success: true, data: {} });
    b.result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await b.result.current.handleSubmit();
    });
    act(() => b.result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=cuentas'));
  });
});

describe('método de pago', () => {
  it('ficha: bancos y cuentas relacionados', () => {
    router.params = { id: '1' };
    const { result } = renderHook(() => useMetodoDetailPage());
    expect(result.current.bancosDelMetodo).toHaveLength(1);
    expect(result.current.cuentasDelMetodo).toHaveLength(1);
    expect(result.current.avatarInitials).toBe('QR');
    result.current.handleVolver();
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=metodos'));
    router.params = { id: '0' };
    const b = renderHook(() => useMetodoDetailPage());
    expect(b.result.current).toMatchObject({ isInvalidId: true, metodo: null, bancosDelMetodo: [] });
  });
  it('formulario: carga y actualiza', async () => {
    router.params = { id: '1' };
    ctx.config.actualizarMetodoPago.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useMetodoForm(), { wrapper });
    await waitFor(() => expect(result.current.form.getFieldValue('nombre')).toBe('QR'));
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: ' Pago QR ' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.config.actualizarMetodoPago).toHaveBeenCalledWith(1, { nombre: 'Pago QR' });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('1'), { replace: true });
  });
  it('formulario: errores', async () => {
    router.params = { id: '55' };
    const { result } = renderHook(() => useMetodoForm(), { wrapper });
    expect(result.current.error).toBe('No se pudo cargar el método de pago');
    ctx.config.actualizarMetodoPago.mockResolvedValue({ success: false, error: 'Mal' });
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Mal');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalled();
    router.params = { id: 'x' };
    const b = renderHook(() => useMetodoForm(), { wrapper });
    expect(b.result.current.isInvalidEditId).toBe(true);
  });
});

describe('reportes y listados', () => {
  it('cuentas por cobrar', () => {
    ctx.cobrar = { reporte: { gestion: { id: 1 }, carreras: [{}], montoMaximoPorEstudiante: 500, resumen: { a: 1 } }, loading: false, error: null, gestionId: 1, refetch: vi.fn() };
    const { result } = renderHook(() => useCuentasPorCobrarPage());
    expect(result.current).toMatchObject({ isEmpty: false, montoMaximoPorEstudiante: 500 });
    expect(result.current.leyenda).toHaveLength(3);
    expect(result.current.observacionesGenerales).toHaveLength(4);
    expect(result.current.fechaEmision).toBeInstanceOf(Date);
    ctx.cobrar = { reporte: null, loading: false, error: null };
    const vacio = renderHook(() => useCuentasPorCobrarPage());
    expect(vacio.result.current).toMatchObject({ isEmpty: true, montoMaximoPorEstudiante: 0, carreras: [] });
  });
  it('ingresos: búsqueda y columnas', () => {
    const setSearchText = vi.fn();
    ctx.ingresos = { ingresos: [{ id: 1 }], setSearchText, searchText: 'x', tablePagination: { total: 1 } };
    const { result } = renderHook(() => useIngresosListPage());
    expect(result.current.tableColumns.length).toBeGreaterThan(0);
    result.current.handleSearchChange({ target: { value: 'abc' } });
    expect(setSearchText).toHaveBeenCalledWith('abc');
    expect(result.current.breadcrumbItems).toHaveLength(3);
    ctx.ingresos = { setSearchText };
    expect(renderHook(() => useIngresosListPage()).result.current).toMatchObject({ ingresos: [], loading: false, error: null, searchText: '' });
  });
});

describe('usePagosDetailPage', () => {
  const base = () => ({
    pagoId: 4, pago: { id: 4 }, loading: false, error: null, refetch: vi.fn(),
    eliminarCuota: vi.fn(), actualizarCuota: vi.fn(), actualizandoCuota: false,
    generarRecibo: vi.fn(), reciboCuotaId: null, descargandoRecibo: false,
    metodosPago: [], cuentasPago: [], loadingCatalogos: false,
  });
  it('vuelve al listado con el estado de navegación', () => {
    ctx.detalle = base();
    router.location = { pathname: '/', state: { returnListPath: '/pagos', menuSidebarKey: 'K' } };
    const { result } = renderHook(() => usePagosDetailPage(), { wrapper });
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/pagos', { state: { menuSidebarKey: 'K' } });
    expect(result.current.breadcrumbItems[2].href).toBe('/pagos');
  });
  it('genera recibo: éxito, error y cuota sin id', async () => {
    ctx.detalle = base();
    ctx.detalle.generarRecibo.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => usePagosDetailPage(), { wrapper });
    await act(async () => {
      await result.current.handleGenerarRecibo({ id: 9 });
    });
    expect(ctx.detalle.generarRecibo).toHaveBeenCalledWith(9);
    await act(async () => {
      await result.current.handleGenerarRecibo({ numeroRecibo: 'R1' });
    });
    expect(ctx.detalle.generarRecibo).toHaveBeenLastCalledWith('R1');
    await act(async () => {
      await result.current.handleGenerarRecibo({});
    });
    expect(ctx.detalle.generarRecibo).toHaveBeenCalledTimes(2);
  });
  it('elimina cuotas', async () => {
    ctx.detalle = base();
    ctx.detalle.eliminarCuota.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => usePagosDetailPage(), { wrapper });
    expect(await result.current.eliminarCuota(null)).toEqual({ success: false, error: 'Cuota inválida' });
    expect(await result.current.eliminarCuota(3)).toEqual({ success: true });
    expect((await result.current.eliminarCuota(3)).error).toBe('No se pudo eliminar la cuota');
  });
  it('edita una cuota: valida el monto y guarda', async () => {
    ctx.detalle = base();
    ctx.detalle.actualizarCuota.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'No' });
    const { result } = renderHook(() => usePagosDetailPage(), { wrapper });
    act(() => result.current.abrirEditarCuota({}));
    expect(result.current.cuotaEnEdicion).toBeNull();
    await act(async () => {
      await result.current.guardarEditarCuota({ monto: 5 });
    });
    expect(ctx.detalle.actualizarCuota).not.toHaveBeenCalled();
    act(() => result.current.abrirEditarCuota({ id: 7 }));
    expect(result.current.cuotaEnEdicion.id).toBe(7);
    await act(async () => {
      await result.current.guardarEditarCuota({ monto: -3 });
    });
    expect(ctx.detalle.actualizarCuota).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.guardarEditarCuota({ monto: '50', metodoPagoId: '2', cuentaPagoId: '3', fechaPago: '2026-05-04', numeroTransaccion: ' T1 ', codigoComprobante: '', descripcion: ' d ' });
    });
    expect(ctx.detalle.actualizarCuota).toHaveBeenCalledWith(7, {
      amount: 50, payment_method_id: 2, payment_account_id: 3, payment_date: '2026-05-04', transaction_number: 'T1', codigo_comprobante: null, descripcion: 'd',
    });
    expect(ctx.detalle.refetch).toHaveBeenCalled();
    expect(result.current.cuotaEnEdicion).toBeNull();
    act(() => result.current.abrirEditarCuota({ id: 8 }));
    await act(async () => {
      await result.current.guardarEditarCuota({ monto: 1 });
    });
    expect(result.current.cuotaEnEdicion.id).toBe(8);
    act(() => result.current.cerrarEditarCuota());
    expect(result.current.cuotaEnEdicion).toBeNull();
  });
});
