import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
const forms = vi.hoisted(() => ({ editar: null, anular: null, llamadas: 0 }));

vi.mock('antd', () => ({
  App: { useApp: () => ({ message: msg }) },
  Form: {
    // 1ª llamada = formulario de editar; 2ª = anular (orden de declaración del hook)
    useForm: () => {
      forms.llamadas += 1;
      return [forms.llamadas % 2 === 1 ? forms.editar : forms.anular];
    },
  },
}));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionPagoAcciones } from '../useInscripcionPagoAcciones';

const inscripcion = {
  estado: 'PENDIENTE',
  pagoCursoExterno: false,
  saldoMatricula: 50,
  saldoCurso: 300,
};
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

describe('useInscripcionPagoAcciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    forms.llamadas = 0;
    forms.editar = { validateFields: vi.fn(), setFieldsValue: vi.fn() };
    forms.anular = { validateFields: vi.fn() };
    ctx.value = {
      inscripcion,
      actualizarPago: vi.fn().mockResolvedValue({ success: true }),
      actualizandoPago: false,
      anularPago: vi.fn().mockResolvedValue({ success: true }),
      anulandoPago: false,
      metodosPago: [{ id: 1, nombre: 'Efectivo', codigo: 'EFECTIVO' }],
      cuentasPago: [],
      loadingCatalogos: false,
      errorCatalogos: null,
    };
  });

  it('evaluarPago bloquea pagos anulados y la inscripción retirada', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    expect(result.current.evaluarPago(pago).permitido).toBe(true);
    expect(result.current.evaluarPago({ ...pago, anulado: true }).permitido).toBe(false);
  });

  it('no abre el modal de un pago anulado', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar({ ...pago, anulado: true }));
    act(() => result.current.abrirAnular({ ...pago, anulado: true }));
    expect(result.current.pagoEditando).toBeNull();
    expect(result.current.pagoAnulando).toBeNull();
  });

  it('editar: el saldo del concepto descuenta el propio pago', () => {
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar(pago));
    expect(result.current.saldosPorConcepto).toEqual({ MATRICULA: 150, CURSO: 300 });
    expect(result.current.conceptoOptions).toHaveLength(2);
  });

  it('editar en curso externo: solo se ofrece matrícula', () => {
    ctx.value.inscripcion = { ...inscripcion, pagoCursoExterno: true };
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar(pago));
    expect(result.current.conceptoOptions.map((o) => o.value)).toEqual(['MATRICULA']);
    expect(result.current.cursoExterno).toBe(true);
  });

  it('editar envía solo lo que cambió y cierra', async () => {
    forms.editar.validateFields.mockResolvedValue({
      concepto: 'MATRICULA',
      monto: 80,
      fechaPago: '2026-10-20',
      metodoPagoId: 1,
      cuentaPagoId: undefined,
      observaciones: '',
    });
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar(pago));
    await act(async () => {
      await result.current.guardarEdicion();
    });
    expect(ctx.value.actualizarPago).toHaveBeenCalledWith(9, { monto: 80 });
    expect(msg.success).toHaveBeenCalledWith('Pago corregido');
    expect(result.current.pagoEditando).toBeNull();
  });

  it('editar sin cambios no llama al backend', async () => {
    forms.editar.validateFields.mockResolvedValue({
      concepto: 'MATRICULA',
      monto: 100,
      fechaPago: '2026-10-20',
      metodoPagoId: 1,
      observaciones: '',
    });
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar(pago));
    await act(async () => {
      await result.current.guardarEdicion();
    });
    expect(ctx.value.actualizarPago).not.toHaveBeenCalled();
    expect(msg.info).toHaveBeenCalled();
  });

  it('editar con error del servidor conserva el modal y muestra el mensaje', async () => {
    ctx.value.actualizarPago.mockResolvedValue({ success: false, error: 'El pago está anulado' });
    forms.editar.validateFields.mockResolvedValue({ ...pago, monto: 10, fechaPago: '2026-10-20' });
    const { result } = renderHook(() => useInscripcionPagoAcciones());
    act(() => result.current.abrirEditar(pago));
    await act(async () => {
      await result.current.guardarEdicion();
    });
    expect(result.current.pagoEditando).not.toBeNull();
    expect(result.current.errorEditar).toBe('El pago está anulado');
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
    expect(msg.success).toHaveBeenCalledWith('Pago anulado');
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
