import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));
const notif = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
const form = vi.hoisted(() => ({ validateFields: vi.fn(), setFieldsValue: vi.fn() }));

vi.mock('antd', () => ({
  App: { useApp: () => ({ notification: notif }) },
  Form: { useForm: () => [form] },
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => ({ state: null }),
  useParams: () => ({ pagoId: '9' }),
}));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionCapEditarPagoPage } from '../useInscripcionCapEditarPagoPage';

const pago = {
  id: 9,
  concepto: 'MATRICULA',
  monto: 100,
  fechaPago: '2026-10-20',
  metodoPagoId: 1,
  cuentaPagoId: null,
  observaciones: null,
  anulado: false,
};

describe('useInscripcionCapEditarPagoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = {
      inscripcionId: '2',
      inscripcion: { id: 2, estado: 'PENDIENTE', pagoCursoExterno: false, saldoMatricula: 50, saldoCurso: 300, pagos: [pago] },
      loading: false,
      refetch: vi.fn().mockResolvedValue(),
      actualizarPago: vi.fn().mockResolvedValue({ success: true }),
      actualizandoPago: false,
      adjuntarComprobantePago: vi.fn().mockResolvedValue({ success: true }),
      subiendoComprobante: false,
      metodosPago: [{ id: 1, nombre: 'Efectivo', codigo: 'EFECTIVO' }],
      cuentasPago: [],
      loadingCatalogos: false,
      errorCatalogos: null,
    };
  });

  it('precarga el formulario con el pago de la URL; el saldo descuenta el propio pago', () => {
    const { result } = renderHook(() => useInscripcionCapEditarPagoPage());
    expect(form.setFieldsValue).toHaveBeenCalledWith(expect.objectContaining({ concepto: 'MATRICULA', monto: 100 }));
    expect(result.current.saldosPorConcepto).toEqual({ MATRICULA: 150, CURSO: 300 });
    expect(result.current.bloqueado).toBe(false);
  });

  it('guarda solo lo que cambió y vuelve al detalle', async () => {
    form.validateFields.mockResolvedValue({ concepto: 'MATRICULA', monto: 80, fechaPago: '2026-10-20', metodoPagoId: 1 });
    const { result } = renderHook(() => useInscripcionCapEditarPagoPage());
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.value.actualizarPago).toHaveBeenCalledWith(9, { monto: 80 });
    expect(ctx.value.adjuntarComprobantePago).not.toHaveBeenCalled();
    expect(nav.navigate).toHaveBeenCalledWith('/capacitacion/inscripciones/2', expect.objectContaining({ replace: true }));
  });

  it('sin cambios ni archivo no llama al backend', async () => {
    form.validateFields.mockResolvedValue({ concepto: 'MATRICULA', monto: 100, fechaPago: '2026-10-20', metodoPagoId: 1 });
    const { result } = renderHook(() => useInscripcionCapEditarPagoPage());
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.value.actualizarPago).not.toHaveBeenCalled();
    expect(notif.info).toHaveBeenCalled();
  });

  it('un error del servidor se muestra y no navega', async () => {
    form.validateFields.mockResolvedValue({ concepto: 'MATRICULA', monto: 80, fechaPago: '2026-10-20', metodoPagoId: 1 });
    ctx.value.actualizarPago.mockResolvedValue({ success: false, error: 'Sobrepago' });
    const { result } = renderHook(() => useInscripcionCapEditarPagoPage());
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Sobrepago');
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('un pago anulado bloquea el formulario', () => {
    ctx.value.inscripcion.pagos = [{ ...pago, anulado: true }];
    const { result } = renderHook(() => useInscripcionCapEditarPagoPage());
    expect(result.current.bloqueado).toBe(true);
  });
});
