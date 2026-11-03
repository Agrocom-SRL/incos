import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from 'antd';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  detail: { student: { student: { nombreCompleto: 'Ana Pérez' } }, loading: false },
  ctx: {},
  downloadFile: vi.fn(),
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@application-matricula/admision/hooks', () => ({ useStudentDetailContext: () => R.detail }));
vi.mock('@application-matricula/aportes/hooks/context/usePagosRegistrarContext', () => ({
  usePagosRegistrarContext: () => R.ctx,
}));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadFile: R.downloadFile }));

import { usePagosRegistrarPageState, OPCIONES_COMPROMISO } from '../usePagosRegistrarPageState';

const render = (state = { studentId: 7 }) =>
  renderHook(() => usePagosRegistrarPageState(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[{ pathname: '/pagos/registrar', state }]}>
        <App>{children}</App>
      </MemoryRouter>
    ),
  });

const config = { configuracionAportes: [{ montoBase: 200 }, { montoBase: 300, aporteActivo: true }] };
const efectivo = { id: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  R.detail = { student: { student: { nombreCompleto: 'Ana Pérez' } }, loading: false };
  R.ctx = {
    configuracionAportes: config,
    metodosPago: { selectedMetodoPago: efectivo },
    cuentasPago: { selectedCuentaPago: { id: 9 } },
    registrarPago: vi.fn().mockResolvedValue({ success: true }),
  };
});
afterEach(() => vi.useRealTimers());

describe('usePagosRegistrarPageState: derivados', () => {
  it('sin estudiante en el state redirige al listado', () => {
    const { result } = render({});
    expect(result.current.sinEstudiante).toBe(true);
    expect(R.navigate).toHaveBeenCalledWith('/pagos/listar', { replace: true });
  });

  it('usa la configuración activa y el saldo base sin beca', () => {
    const { result } = render();
    expect(result.current.configuracionAporteActiva.montoBase).toBe(300);
    expect(result.current.saldoPendiente).toBe(300);
    expect(result.current.esPagoGratuito).toBe(false);
    expect(result.current.pageTitle).toBe('Registrar pago - Ana Pérez');
    expect(result.current.breadcrumbItems[2].href).toBe('/pagos/listar');
    expect(result.current.opcionesCompromiso).toBe(OPCIONES_COMPROMISO);
    expect(result.current.registrarDisabled).toBe(true);
  });

  it('configuración vacía usa la primera y la lista inexistente da saldo cero', () => {
    R.ctx.configuracionAportes = { configuracionAportes: [{ montoBase: 50 }] };
    expect(render().result.current.saldoPendiente).toBe(50);
    R.ctx.configuracionAportes = { configuracionAportes: [] };
    const { result } = render();
    expect(result.current.configuracionAporteActiva).toBeNull();
    expect(result.current.saldoPendiente).toBe(0);
    expect(result.current.esPagoGratuito).toBe(true);
    expect(result.current.registrarDisabled).toBe(true);
  });

  it('aplica el descuento de una beca activa', () => {
    R.ctx.becaActiva = { estado: 'activa', porcentaje: 50 };
    const { result } = render();
    expect(result.current.saldoPendiente).toBe(150);
    expect(result.current.porcentajeBeca).toBe(50);
    expect(result.current.descuentoBeca).toBe(150);
    expect(result.current.ocultarBotonAsignarBeca).toBe(true);
    R.ctx.becaActiva = { state: 'INACTIVA', porcentaje: 50 };
    expect(render().result.current.saldoPendiente).toBe(300);
    R.ctx.becaActiva = { porcentaje: 50 };
    expect(render().result.current.saldoPendiente).toBe(300);
  });

  it('el estado del aporte manda sobre la configuración', () => {
    R.ctx.estadoActualAporte = { saldo_pendiente: 100, descuento_beca: '20', cantidad_pagos: 0, cuotas: [] };
    const { result } = render({ studentId: 7, returnListPath: '/x', menuSidebarKey: 'k' });
    expect(result.current.saldoPendiente).toBe(100);
    expect(result.current.descuentoBeca).toBe(20);
    expect(result.current.esPrimeraCuota).toBe(true);
    expect(result.current.mostrarSelectorCompromiso).toBe(true);
    expect(result.current.saldoRestanteCompromiso).toBe(100);
    expect(result.current.breadcrumbItems[2].href).toBe('/x');
    R.ctx.estadoActualAporte = { saldo_pendiente: 100, tiene_descuento_aplicado: true, cantidad_pagos: 2 };
    const otra = render();
    expect(otra.result.current.esPrimeraCuota).toBe(false);
    expect(otra.result.current.ocultarBotonAsignarBeca).toBe(true);
  });

  it('acota el monto de la cuota al saldo y calcula cancelaTodo y la fecha de compromiso', () => {
    const { result } = render();
    act(() => result.current.form.setFieldsValue({ montoCuota: 999.7 }));
    expect(result.current.montoCuota).toBe(300);
    expect(result.current.cancelaTodo).toBe(true);
    act(() => result.current.form.setFieldsValue({ montoCuota: 100 }));
    expect(result.current.saldoRestanteCompromiso).toBe(200);
    act(() => result.current.form.setFieldsValue({ montoCuota: 'abc' }));
    expect(result.current.montoCuota).toBe('abc');
    act(() => result.current.form.setFieldsValue({ montoCuota: '' }));
    expect(result.current.montoCuota).toBe('');
    act(() => result.current.form.setFieldsValue({ montoCuota: -5 }));
    expect(result.current.montoCuota).toBe(0);
    act(() => result.current.setCompromisoDias(15));
    expect(result.current.compromisoDias).toBe(15);
    expect(result.current.fechaCompromisoProyectada).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    act(() => result.current.form.setFieldsValue({ fechaPago: '2026-01-01' }));
    expect(result.current.fechaCompromisoProyectada).toBe('2026-01-16');
  });

  it('redirige al detalle cuando el aporte ya está cubierto', () => {
    R.ctx.estadoActualAporte = { saldo_pendiente: 0, cabecera: { id: 33 } };
    const { result } = render({ studentId: 7, menuSidebarKey: 'k' });
    expect(result.current.redirigiendoADetalle).toBe(true);
    expect(R.navigate).toHaveBeenCalledWith('/pagos/33', { replace: true, state: { studentId: 7, menuSidebarKey: 'k' } });
  });

  it('cargandoDatosBase refleja cualquier carga pendiente', () => {
    R.detail.loading = true;
    expect(render().result.current.cargandoDatosBase).toBe(true);
    R.detail.loading = false;
    R.ctx.loadingScholarships = true;
    expect(render().result.current.cargandoDatosBase).toBe(true);
    R.ctx.loadingScholarships = false;
    R.ctx.configuracionAportes = { ...config, loading: true };
    expect(render().result.current.cargandoDatosBase).toBe(true);
  });
});

describe('usePagosRegistrarPageState: navegación', () => {
  it('volver a la lista o a la ficha', () => {
    const a = render({ studentId: 7, returnListPath: '/lista', menuSidebarKey: 'm' });
    act(() => a.result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'm' } });
    const b = render({ studentId: 7, returnListPath: '/lista' });
    act(() => b.result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/lista', { state: undefined });
    const c = render();
    act(() => c.result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/7');
  });

  it('asignar beca lleva el estado de retorno', () => {
    const { result } = render({ studentId: 7, returnListPath: '/lista', menuSidebarKey: 'm' });
    act(() => result.current.handleAsignarBeca());
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/becas/asignar', {
      state: { studentId: 7, returnTo: '/pagos/registrar', returnState: { studentId: 7, returnListPath: '/lista', menuSidebarKey: 'm' } },
    });
    const sin = render({});
    act(() => sin.result.current.handleAsignarBeca());
    expect(R.navigate).not.toHaveBeenLastCalledWith('/estudiantes/becas/asignar', expect.anything());
  });
});

describe('usePagosRegistrarPageState: validarPasoDatosPago', () => {
  it('rechaza sin configuración, monto inválido, monto mayor al saldo y sin método', async () => {
    R.ctx.configuracionAportes = { configuracionAportes: [] };
    await expect(render().result.current.validarPasoDatosPago()).rejects.toThrow('Sin configuración de aporte');

    R.ctx.configuracionAportes = config;
    const a = render();
    await expect(a.result.current.validarPasoDatosPago()).rejects.toThrow('Monto de cuota inválido');

    R.ctx.metodosPago = { selectedMetodoPago: null };
    const b = render();
    act(() => b.result.current.form.setFieldsValue({ montoCuota: 100 }));
    await expect(b.result.current.validarPasoDatosPago()).rejects.toThrow('Método de pago no seleccionado');
  });

  it('resuelve con los valores del formulario', async () => {
    const { result } = render();
    act(() => result.current.form.setFieldsValue({ montoCuota: 100 }));
    await expect(result.current.validarPasoDatosPago()).resolves.toBeDefined();
    R.ctx.configuracionAportes = { configuracionAportes: [] };
    R.ctx.estadoActualAporte = { saldo_pendiente: 0 };
    const gratis = render();
    await expect(gratis.result.current.validarPasoDatosPago()).resolves.toBeDefined();
  });
});

describe('usePagosRegistrarPageState: handleFinish', () => {
  const montoYFecha = (result, monto = 100) => act(() => result.current.form.setFieldsValue({ montoCuota: monto }));
  const enviar = async (result, values) => {
    await act(async () => {
      await result.current.handleFinish(values);
    });
  };

  it('valida el identificador del estudiante', async () => {
    const { result } = render({ studentId: 'abc' });
    await enviar(result, {});
    expect(R.ctx.registrarPago).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('rechaza monto inválido, método ausente o inexistente y fecha', async () => {
    const a = render();
    await enviar(a.result, { fechaPago: '2026-01-01' });
    expect(R.ctx.registrarPago).not.toHaveBeenCalled();

    R.ctx.metodosPago = { selectedMetodoPago: null };
    const b = render();
    montoYFecha(b.result);
    await enviar(b.result, { fechaPago: '2026-01-01' });
    R.ctx.metodosPago = { selectedMetodoPago: { id: 9 } };
    const c = render();
    montoYFecha(c.result);
    await enviar(c.result, { fechaPago: '2026-01-01' });
    R.ctx.metodosPago = { selectedMetodoPago: efectivo };
    const d = render();
    montoYFecha(d.result);
    await enviar(d.result, {});
    await enviar(d.result, { fechaPago: '2026-01-01', descripcion: 'x'.repeat(501) });
    expect(R.ctx.registrarPago).not.toHaveBeenCalled();
  });

  it('exige cuenta para transferencia/depósito y comprobante para QR/transferencia/depósito', async () => {
    R.ctx.cuentasPago = { selectedCuentaPago: null };
    R.ctx.metodosPago = { selectedMetodoPago: { id: 3 } };
    const a = render();
    montoYFecha(a.result);
    await enviar(a.result, { fechaPago: '2026-01-01' });
    R.ctx.metodosPago = { selectedMetodoPago: { id: 4 } };
    const a2 = render();
    montoYFecha(a2.result);
    await enviar(a2.result, { fechaPago: '2026-01-01', cuentaPagoId: 'x' });
    R.ctx.metodosPago = { selectedMetodoPago: { id: 2 } };
    const b = render();
    montoYFecha(b.result);
    await enviar(b.result, { fechaPago: '2026-01-01', codigoComprobante: '  ' });
    R.ctx.metodosPago = { selectedMetodoPago: { id: 3 } };
    const b2 = render();
    montoYFecha(b2.result);
    await enviar(b2.result, { fechaPago: '2026-01-01', cuentaPagoId: 4, codigoComprobante: '' });
    expect(R.ctx.registrarPago).not.toHaveBeenCalled();
  });

  it('envía el pago en transferencia con cuenta, comprobante y documento de respaldo', async () => {
    vi.useFakeTimers();
    R.ctx.metodosPago = { selectedMetodoPago: { id: 3 } };
    R.ctx.estadoActualAporte = { saldo_pendiente: 300, cantidad_pagos: 0, cuotas: [] };
    const { result } = render();
    montoYFecha(result);
    const file = { originFileObj: new Blob(['x']) };
    await enviar(result, { fechaPago: '2026-02-03', cuentaPagoId: '4', codigoComprobante: ' C-1 ', numeroTransaccion: ' T9 ', descripcion: ' ok ', documentoRespaldo: [file] });
    expect(R.ctx.registrarPago).toHaveBeenCalledWith({
      studentId: 7,
      amount: 100,
      paymentMethodId: 3,
      paymentAccountId: 4,
      paymentDate: '2026-02-03',
      transactionNumber: 'T9',
      codigoComprobante: 'C-1',
      descripcion: 'ok',
      documentoRespaldo: file.originFileObj,
      compromisoDias: 90,
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/7');
  });

  it('descarga el recibo, y si falla avisa y redirige igual', async () => {
    vi.useFakeTimers();
    R.ctx.registrarPago = vi.fn().mockResolvedValue({ success: true, data: { reciboPDF: 'uploads/recibo_1.pdf' } });
    const { result } = render();
    montoYFecha(result);
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(R.downloadFile).toHaveBeenCalledWith('/uploads/recibo_1.pdf', 'recibo_1.pdf');
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/7');

    R.downloadFile.mockImplementationOnce(() => {
      throw new Error('x');
    });
    await enviar(result, { fechaPago: '2026-02-03' });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(R.navigate).toHaveBeenLastCalledWith('/estudiantes/7');
  });

  it('pago gratuito no exige método ni monto', async () => {
    vi.useFakeTimers();
    R.ctx.configuracionAportes = { configuracionAportes: [] };
    R.ctx.estadoActualAporte = { saldo_pendiente: 0 };
    R.ctx.metodosPago = null;
    const { result } = render();
    await enviar(result, {});
    expect(R.ctx.registrarPago).toHaveBeenCalledWith(expect.objectContaining({ amount: 0, paymentMethodId: 1, paymentAccountId: null, compromisoDias: undefined }));
  });

  it('muestra el error del servicio en sus variantes', async () => {
    const { result } = render();
    montoYFecha(result);
    R.ctx.registrarPago.mockResolvedValueOnce({ success: false, error: { message: 'Detalle' } });
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.submitError).toBe('Detalle');
    R.ctx.registrarPago.mockResolvedValueOnce({ success: false, error: { code: 1 } });
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.submitError).toBe('{"code":1}');
    R.ctx.registrarPago.mockResolvedValueOnce({ success: false, error: 'Texto' });
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.submitError).toBe('Texto');
    R.ctx.registrarPago.mockResolvedValueOnce(null);
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.submitError).toBe('Error al registrar el pago');
    R.ctx.registrarPago.mockRejectedValueOnce(new Error('x'));
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('sin servicio de registro no envía', async () => {
    R.ctx.registrarPago = undefined;
    const { result } = render();
    montoYFecha(result);
    await enviar(result, { fechaPago: '2026-02-03' });
    expect(result.current.isSubmitting).toBe(false);
  });
});
