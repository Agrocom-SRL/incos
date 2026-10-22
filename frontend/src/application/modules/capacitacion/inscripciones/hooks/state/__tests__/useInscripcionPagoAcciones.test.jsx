import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
const forms = vi.hoisted(() => ({ anular: null }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('antd', () => ({
  App: { useApp: () => ({ message: msg }) },
  Form: { useForm: () => [forms.anular] },
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => ({ state: { returnListPath: '/capacitacion/inscripciones' } }),
}));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionPagoAcciones } from '../useInscripcionPagoAcciones';

const inscripcion = { id: 2, estado: 'PENDIENTE', pagoCursoExterno: false };
const pago = { id: 9, concepto: 'MATRICULA', monto: 100, anulado: false };

describe('useInscripcionPagoAcciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    forms.anular = { validateFields: vi.fn() };
    ctx.value = {
      inscripcion,
      anularPago: vi.fn().mockResolvedValue({ success: true }),
      anulandoPago: false,
    };
  });

  it('evaluarPago bloquea pagos anulados y la inscripción retirada', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    expect(result.current.evaluarPago(pago).permitido).toBe(true);
    expect(result.current.evaluarPago({ ...pago, anulado: true }).permitido).toBe(false);
  });

  it('editar navega a la página «Editar pago» conservando el estado de navegación', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.irAEditar(pago));
    expect(nav.navigate).toHaveBeenCalledWith('/capacitacion/inscripciones/2/pagos/9/editar', {
      state: { returnListPath: '/capacitacion/inscripciones' },
    });
  });

  it('no edita ni anula un pago anulado', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.irAEditar({ ...pago, anulado: true }));
    act(() => result.current.abrirAnular({ ...pago, anulado: true }));
    expect(nav.navigate).not.toHaveBeenCalled();
    expect(result.current.pagoAnulando).toBeNull();
  });

  it('anular envía el motivo recortado y cierra', async () => {
    forms.anular.validateFields.mockResolvedValue({ motivo: '  Monto equivocado  ' });
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirAnular(pago));
    expect(result.current.pagoAnulando).toBe(pago);
    await act(async () => {
      await result.current.confirmarAnulacion();
    });
    expect(ctx.value.anularPago).toHaveBeenCalledWith(9, 'Monto equivocado');
    expect(msg.success).toHaveBeenCalledWith('Pago eliminado');
    expect(result.current.pagoAnulando).toBeNull();
  });

  it('anular sin motivo válido no llama al backend; un error del servidor deja el modal abierto', async () => {
    forms.anular.validateFields.mockRejectedValueOnce({ errorFields: [{}] });
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirAnular(pago));
    await act(async () => {
      await result.current.confirmarAnulacion();
    });
    expect(ctx.value.anularPago).not.toHaveBeenCalled();

    forms.anular.validateFields.mockResolvedValue({ motivo: 'abc' });
    ctx.value.anularPago.mockResolvedValue({ success: false, error: 'Pago ya anulado' });
    await act(async () => {
      await result.current.confirmarAnulacion();
    });
    expect(result.current.errorAnular).toBe('Pago ya anulado');
    expect(result.current.pagoAnulando).not.toBeNull();
  });
});
