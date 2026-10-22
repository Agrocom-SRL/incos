import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
}));
vi.mock('antd', () => ({ App: { useApp: () => ({ message: msg }) } }));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionCapacitacionDetailPage } from '../useInscripcionCapacitacionDetailPage';

const inscripcion = {
  estado: 'PENDIENTE',
  saldoMatricula: 150,
  saldoCurso: 0,
  requisitos: [
    { requisitoId: 1, descripcion: 'CI', obligatorio: true, entregado: false, fechaEntrega: null },
  ],
};

describe('useInscripcionCapacitacionDetailPage · requisitos y comprobantes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = {
      inscripcionId: 10,
      inscripcion,
      loading: false,
      error: null,
      anularInscripcion: vi.fn(),
      anulando: false,
      guardarRequisitos: vi.fn().mockResolvedValue({ success: true }),
      guardandoRequisitos: false,
      adjuntarComprobantePago: vi.fn().mockResolvedValue({ success: true }),
      subiendoComprobante: false,
      descargarComprobantePago: vi.fn().mockResolvedValue({ success: true }),
      descargarFormularioPdf: vi.fn().mockResolvedValue({ success: true }),
      descargarReciboPdfPago: vi.fn().mockResolvedValue({ success: true }),
    };
  });

  it('calcula qué falta para INSCRITO', () => {
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    expect(result.current.pendientes.map((p) => p.key)).toEqual(['matricula', 'requisitos']);
  });

  it('marcar un requisito crea un borrador y guardar envía el checklist completo', async () => {
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    expect(result.current.requisitosDirty).toBe(false);

    act(() => result.current.handleToggleRequisito(1, true));
    expect(result.current.requisitosDirty).toBe(true);
    expect(result.current.requisitosDraft[0].entregado).toBe(true);

    await act(async () => {
      await result.current.handleGuardarRequisitos();
    });
    const enviado = ctx.value.guardarRequisitos.mock.calls[0][0];
    expect(enviado).toHaveLength(1);
    expect(enviado[0]).toMatchObject({ requisitoId: 1, entregado: true });
    expect(msg.success).toHaveBeenCalled();
    expect(result.current.requisitosDirty).toBe(false);
  });

  it('descartar vuelve al estado persistido', () => {
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    act(() => result.current.handleToggleRequisito(1, true));
    act(() => result.current.handleDescartarRequisitos());
    expect(result.current.requisitosDraft[0].entregado).toBe(false);
  });

  it('si guardar falla muestra el error y conserva el borrador', async () => {
    ctx.value.guardarRequisitos.mockResolvedValue({ success: false, error: 'Boom' });
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    act(() => result.current.handleToggleRequisito(1, true));
    await act(async () => {
      await result.current.handleGuardarRequisitos();
    });
    expect(msg.error).toHaveBeenCalledWith('Boom');
    expect(result.current.requisitosDirty).toBe(true);
  });

  it('adjuntar comprobante informa el resultado', async () => {
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    const file = new File(['x'], 'dep.pdf');
    let ok;
    await act(async () => {
      ok = await result.current.handleAdjuntarComprobante(7, file);
    });
    expect(ctx.value.adjuntarComprobantePago).toHaveBeenCalledWith(7, file);
    expect(ok).toBe(true);
    expect(msg.success).toHaveBeenCalled();
  });

  it('descargar comprobante muestra el error del backend', async () => {
    ctx.value.descargarComprobantePago.mockResolvedValue({ success: false, error: 'No existe' });
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    await act(async () => {
      await result.current.handleDescargarComprobante(7);
    });
    expect(msg.error).toHaveBeenCalledWith('No existe');
  });

  it('descargar formulario PDF muestra el error y libera el loading', async () => {
    ctx.value.descargarFormularioPdf.mockResolvedValue({ success: false, error: 'Sin datos' });
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    await act(async () => {
      await result.current.handleDescargarFormulario();
    });
    expect(msg.error).toHaveBeenCalledWith('Sin datos');
    expect(result.current.descargandoFormulario).toBe(false);
  });

  it('descargar recibo PDF llama con el pago y limpia el loading por pago', async () => {
    const { result } = renderHook(() => useInscripcionCapacitacionDetailPage());
    await act(async () => {
      await result.current.handleDescargarRecibo(7);
    });
    expect(ctx.value.descargarReciboPdfPago).toHaveBeenCalledWith(7);
    expect(result.current.reciboDescargandoId).toBeNull();
    expect(msg.error).not.toHaveBeenCalled();
  });
});
