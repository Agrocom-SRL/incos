import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({ registrar: {}, aporte: {}, beca: {} }));
vi.mock('@application-finanzas/hooks/context/usePagosRegistrarContext', () => ({ usePagosRegistrarContext: () => ctx.registrar }));
vi.mock('@application-finanzas/aportes/hooks/context/useAporteContext', () => ({ useAporteContext: () => ctx.aporte }));
vi.mock('@application-finanzas/becas-descuentos/hooks/context/useBecaDescuentoContext', () => ({ useBecaDescuentoContext: () => ctx.beca }));

const del = vi.hoisted(() => ({ deleteItem: vi.fn(), opts: null }));
vi.mock('@application/utils/useDeleteItem', () => ({
  useDeleteItem: (opts) => {
    del.opts = opts;
    return { deleteItem: del.deleteItem, loading: false };
  },
}));
vi.mock('@application-shared/hooks', () => ({ useToggleEstadoCatalogo: vi.fn(() => 'toggle') }));

import { usePagosRegistrarPage } from '../usePagosRegistrarPage';
import { useAportePage } from '../../../aportes/hooks/state/useAportePage';
import { useBecaDescuentoDetallePage } from '../../../becas-descuentos/hooks/state/useBecaDescuentoDetallePage';
import { useBecaDescuentoForm } from '../../../becas-descuentos/hooks/state/useBecaDescuentoForm';
import { useBecaDescuentoListPage } from '../../../becas-descuentos/hooks/state/useBecaDescuentoListPage';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/', state: null };
});

describe('usePagosRegistrarPage', () => {
  const base = () => ({
    estudiantes: [], loadingBusqueda: false, errorBusqueda: null, buscarEstudiantes: vi.fn(), cargarEstudiantesPreliminar: vi.fn(),
    estado: { cabeceraId: 5, saldoPendiente: 100 }, loadingEstado: false, errorEstado: null, cargarEstado: vi.fn(), limpiarEstado: vi.fn(),
    metodosPago: [{ id: 1, codigo: 'EFECTIVO' }, { id: 3, codigo: 'TRANSFERENCIA' }], cuentasPago: [], loadingCatalogos: false, errorCatalogos: null,
    registrarPago: vi.fn(), registrando: false, guardarCompromiso: vi.fn(),
  });
  const montar = (over = {}) => {
    ctx.registrar = { ...base(), ...over };
    return renderHook(() => usePagosRegistrarPage(), { wrapper });
  };

  it('carga estudiantes preliminares y gestiona la selección', () => {
    const { result } = montar();
    expect(ctx.registrar.cargarEstudiantesPreliminar).toHaveBeenCalled();
    act(() => result.current.handleSeleccionarEstudiante({}));
    expect(ctx.registrar.cargarEstado).not.toHaveBeenCalled();
    act(() => result.current.handleSeleccionarEstudiante({ id: 9 }));
    expect(ctx.registrar.cargarEstado).toHaveBeenCalledWith(9);
    expect(result.current.saldoPendiente).toBe(100);
    act(() => result.current.handleMetodoPagoChange(3));
    expect(result.current.metodoPagoId).toBe(3);
    expect(result.current.reglasMetodo.cuentaVisible).toBe(true);
    act(() => result.current.handleCambiarEstudiante());
    expect(result.current.estudianteSeleccionado).toBeNull();
    expect(ctx.registrar.limpiarEstado).toHaveBeenCalled();
    router.location = { pathname: '/', state: { returnListPath: '/pagos', menuSidebarKey: 'K' } };
    const b = montar();
    act(() => b.result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/pagos', { state: { menuSidebarKey: 'K' } });
  });

  it('valida estudiante, monto y saldo antes de registrar', async () => {
    const { result } = montar();
    await act(async () => {
      await result.current.handleFinish({ monto: 10 });
    });
    act(() => result.current.handleSeleccionarEstudiante({ id: 9 }));
    await act(async () => {
      await result.current.handleFinish({ monto: 'x' });
      await result.current.handleFinish({ monto: -1 });
      await result.current.handleFinish({ monto: 500 });
    });
    expect(ctx.registrar.registrarPago).not.toHaveBeenCalled();
  });

  it('registra el pago con archivo y navega al detalle', async () => {
    const { result } = montar({ registrarPago: vi.fn().mockResolvedValue({ success: true }) });
    act(() => result.current.handleSeleccionarEstudiante({ id: 9 }));
    act(() => result.current.handleMetodoPagoChange(3));
    await act(async () => {
      await result.current.handleFinish({ monto: '40', cuentaPagoId: '2', fechaPago: '2026-05-04', numeroTransaccion: ' T ', documentoRespaldo: [{ originFileObj: 'F' }] });
    });
    expect(ctx.registrar.registrarPago).toHaveBeenCalledWith({
      student_id: 9, amount: 40, payment_method_id: 3, payment_account_id: 2, payment_date: '2026-05-04',
      transaction_number: 'T', codigo_comprobante: null, descripcion: null, documentoRespaldo: 'F',
    });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('5'), expect.any(Object));
  });

  it('guarda compromiso si queda saldo; avisa si el compromiso falla', async () => {
    const guardar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'No' });
    const { result } = montar({ registrarPago: vi.fn().mockResolvedValue({ success: true }), guardarCompromiso: guardar });
    act(() => result.current.handleSeleccionarEstudiante({ id: 9 }));
    act(() => result.current.handleMetodoPagoChange(1));
    await act(async () => {
      await result.current.handleFinish({ monto: 10, fechaCompromiso: '2026-06-01' });
    });
    expect(guardar).toHaveBeenCalledWith({ pagoAporteId: 5, values: { fechaCompromiso: '2026-06-01' } });
    await act(async () => {
      await result.current.handleFinish({ monto: 10, fechaCompromiso: '2026-06-01' });
    });
    expect(guardar).toHaveBeenCalledTimes(2);
  });

  it('error al registrar no navega; sin cabecera vuelve al listado', async () => {
    const a = montar({ registrarPago: vi.fn().mockResolvedValue({ success: false, error: 'Mal' }) });
    act(() => a.result.current.handleSeleccionarEstudiante({ id: 9 }));
    await act(async () => {
      await a.result.current.handleFinish({ monto: 10 });
    });
    expect(router.navigate).not.toHaveBeenCalled();
    const b = montar({ estado: { saldoPendiente: 0 }, registrarPago: vi.fn().mockResolvedValue({ success: true }) });
    act(() => b.result.current.handleSeleccionarEstudiante({ id: 9 }));
    await act(async () => {
      await b.result.current.handleFinish({ monto: 10 });
    });
    expect(router.navigate).toHaveBeenCalledWith(expect.any(String), { state: { menuSidebarKey: 'FIN-PAG' } });
  });
});

describe('useAportePage', () => {
  const base = (over = {}) => ({
    gestionVigente: { id: 1 }, aporteVigente: { id: 4, montoBase: 600, fechaInicio: '2026-01-01', aporteActivo: false }, loading: false, error: null,
    refetch: vi.fn(), saving: false, guardarConfiguracionAporte: vi.fn(), ...over,
  });
  it('rellena el formulario con el aporte vigente', async () => {
    ctx.aporte = base();
    const { result } = renderHook(() => useAportePage(), { wrapper });
    await waitFor(() => expect(result.current.form.getFieldValue('montoBase')).toBe(600));
    expect(result.current.form.getFieldValue('tieneFechaFin')).toBe(false);
    expect(result.current.formSections.datosAporte.fields.map((f) => f.name)).not.toContain('fechaFin');
    const regla = result.current.formSections.datosAporte.fields[0].rules[0];
    await expect(regla.validator(null, 0)).rejects.toThrow('mayor a 0');
    await expect(regla.validator(null, 10)).resolves.toBeUndefined();
  });
  it('guarda: éxito y error', async () => {
    ctx.aporte = base();
    ctx.aporte.guardarConfiguracionAporte.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => useAportePage(), { wrapper });
    let ok;
    await act(async () => {
      ok = await result.current.guardarAporte({ montoBase: '700', fechaInicio: '2026-02-01', tieneFechaFin: true, fechaFin: '2026-12-01' });
    });
    expect(ok).toBe(true);
    expect(ctx.aporte.guardarConfiguracionAporte).toHaveBeenCalledWith({ id: 4, payload: { monto_base: 700, aporte_activo: false, fecha_inicio: '2026-02-01', fecha_fin: '2026-12-01' } });
    expect(ctx.aporte.refetch).toHaveBeenCalled();
    await act(async () => {
      ok = await result.current.guardarAporte({ montoBase: 1 });
    });
    expect(ok).toBe(false);
  });
  it('sin aporte crea uno nuevo y vuelve a la pestaña indicada', async () => {
    ctx.aporte = base({ aporteVigente: null });
    ctx.aporte.guardarConfiguracionAporte.mockResolvedValue({ success: true });
    router.location = { pathname: '/', state: { returnTab: 'bancos' } };
    const { result } = renderHook(() => useAportePage(), { wrapper });
    await act(async () => {
      await result.current.guardarAporte({ montoBase: 5 });
    });
    expect(ctx.aporte.guardarConfiguracionAporte).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ aporte_activo: true, fecha_inicio: null }) });
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=bancos'));
    router.location = { pathname: '/', state: null };
    const b = renderHook(() => useAportePage(), { wrapper });
    act(() => b.result.current.handleVolver());
    expect(router.navigate).toHaveBeenLastCalledWith(expect.not.stringContaining('tab='));
  });
});

describe('becas y descuentos', () => {
  const base = (over = {}) => ({
    becasDescuentos: [{ id: 2, nombre: 'Excelencia', esAutomatica: false }], loading: false, error: null, refetch: vi.fn(),
    eliminar: vi.fn(), crear: vi.fn(), actualizar: vi.fn(), saving: false, ...over,
  });
  it('ficha: navegación y eliminación', () => {
    ctx.beca = base();
    router.params = { id: '2' };
    const { result } = renderHook(() => useBecaDescuentoDetallePage());
    expect(result.current.beca.nombre).toBe('Excelencia');
    expect(result.current.avatarInitials).toBe('EX');
    expect(del.opts.itemName).toBe('la beca o descuento Excelencia');
    act(() => {
      result.current.handleEditar();
      result.current.handleVerAsignaciones();
      result.current.handleEliminar();
      result.current.handleVolver();
    });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('scholarshipId=2'));
    expect(del.deleteItem).toHaveBeenCalledWith(2);
    router.navigate.mockClear();
    router.params = { id: '99' };
    const b = renderHook(() => useBecaDescuentoDetallePage());
    act(() => {
      b.result.current.handleEditar();
      b.result.current.handleVerAsignaciones();
    });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(del.opts.itemName).toBe('esta beca o descuento');
    router.params = { id: 'x' };
    expect(renderHook(() => useBecaDescuentoDetallePage()).result.current.isInvalidId).toBe(true);
  });
  it('formulario: alta, edición y errores', async () => {
    ctx.beca = base();
    ctx.beca.crear.mockResolvedValue({ success: true, data: { becaDescuento: { id: 7 } } });
    const { result } = renderHook(() => useBecaDescuentoForm('create'), { wrapper });
    expect(result.current.formSections.reglasAplicacion.fields).toHaveLength(3);
    result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: 'Nueva', porcentaje: 30 });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.beca.crear).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Nueva', porcentaje: 30 }));
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('7'), { replace: true });

    router.params = { id: '2' };
    ctx.beca.actualizar.mockResolvedValue({ success: false, error: 'Mal' });
    const e = renderHook(() => useBecaDescuentoForm('edit'), { wrapper });
    await waitFor(() => expect(e.result.current.form.getFieldValue('nombre')).toBe('Excelencia'));
    expect(e.result.current.formSections.reglasAplicacion.fields.map((f) => f.name)).toContain('activo');
    e.result.current.form.validateFields = vi.fn().mockResolvedValue({ nombre: 'X' });
    await act(async () => {
      await e.result.current.handleSubmit();
    });
    expect(ctx.beca.actualizar).toHaveBeenCalledWith(2, expect.any(Object));
    expect(e.result.current.error).toBe('Mal');
    e.result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await e.result.current.handleSubmit();
    });
    expect(e.result.current.error).toBe('Revise los campos obligatorios');
    act(() => e.result.current.handleVolver());
    router.params = { id: '88' };
    expect(renderHook(() => useBecaDescuentoForm('edit'), { wrapper }).result.current.error).toBe('No se pudo cargar la beca o descuento');
    router.params = { id: 'x' };
    expect(renderHook(() => useBecaDescuentoForm('edit'), { wrapper }).result.current.isInvalidEditId).toBe(true);
    ctx.beca.crear.mockResolvedValue({ success: true, data: {} });
    const c = renderHook(() => useBecaDescuentoForm('create'), { wrapper });
    c.result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await c.result.current.handleSubmit();
    });
  });
  it('listado: búsqueda por nombre, código o descripción', () => {
    ctx.beca = base({ becasDescuentos: [{ id: 1, nombre: 'Excelencia', codigo: 'EXC' }, { id: 2, nombre: 'Social', descripcion: 'apoyo' }] });
    const { result } = renderHook(() => useBecaDescuentoListPage());
    expect(result.current.becasDescuentos).toHaveLength(2);
    expect(result.current.toggleEstado).toBe('toggle');
    act(() => result.current.setSearchText('apoyo'));
    expect(result.current.becasDescuentos.map((b) => b.id)).toEqual([2]);
    expect(result.current.breadcrumbItems).toHaveLength(3);
  });
});
