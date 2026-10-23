import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const api = vi.hoisted(() => ({
  cargar: vi.fn(),
  actualizarRequisitos: vi.fn(),
  inscripcion: null,
}));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('antd', () => ({ App: { useApp: () => ({ message: msg }) } }));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/api/useGetInscripcionCapacitacion',
  () => ({
    useGetInscripcionCapacitacion: () => ({
      inscripcion: api.inscripcion,
      loading: false,
      error: null,
      cargar: api.cargar,
    }),
  }),
);
vi.mock(
  '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations',
  () => ({
    useInscripcionCapacitacionMutations: () => ({
      actualizarRequisitos: api.actualizarRequisitos,
      guardandoRequisitos: false,
    }),
  }),
);

import { useInscripcionRequisitosRapido } from '../useInscripcionRequisitosRapido';

const ficha = {
  id: 10,
  estado: 'PENDIENTE',
  saldoMatricula: 0,
  saldoCurso: 0,
  requisitos: [
    { requisitoId: 1, descripcion: 'Depósito', obligatorio: true, entregado: false, fechaEntrega: null },
    { requisitoId: 2, descripcion: 'CI', obligatorio: true, entregado: true, fechaEntrega: '2026-10-20' },
  ],
};

describe('useInscripcionRequisitosRapido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.inscripcion = ficha;
    api.actualizarRequisitos.mockResolvedValue({ success: true });
  });

  it('cerrado (sin id) no carga nada', () => {
    const { result } = renderHook(() => useInscripcionRequisitosRapido({ inscripcionId: null }));
    expect(api.cargar).not.toHaveBeenCalled();
    expect(result.current.abierto).toBe(false);
    expect(result.current.ficha).toBeNull();
  });

  it('al abrir carga la ficha y marcar un requisito activa los cambios', () => {
    const { result } = renderHook(() => useInscripcionRequisitosRapido({ inscripcionId: 10 }));
    expect(api.cargar).toHaveBeenCalledWith(10);
    expect(result.current.hayCambios).toBe(false);
    expect(result.current.pendientes.map((p) => p.key)).toEqual(['requisitos']);

    act(() => result.current.handleToggle(1, true));
    expect(result.current.hayCambios).toBe(true);
    expect(result.current.requisitos[0].entregado).toBe(true);
  });

  it('guardar envía el checklist completo, avisa y cierra', async () => {
    const onGuardado = vi.fn();
    const onCerrar = vi.fn();
    const { result } = renderHook(() =>
      useInscripcionRequisitosRapido({ inscripcionId: 10, onGuardado, onCerrar }),
    );
    act(() => result.current.handleToggle(1, true));
    await act(async () => {
      await result.current.handleGuardar();
    });

    const [id, payload] = api.actualizarRequisitos.mock.calls[0];
    expect(id).toBe(10);
    expect(payload).toEqual([
      { requisitoId: 1, entregado: true, fechaEntrega: expect.any(String) },
      { requisitoId: 2, entregado: true, fechaEntrega: '2026-10-20' },
    ]);
    expect(msg.success).toHaveBeenCalled();
    expect(onGuardado).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalled();
  });

  it('si falla el guardado muestra el error y no cierra', async () => {
    api.actualizarRequisitos.mockResolvedValue({ success: false, error: 'boom' });
    const onCerrar = vi.fn();
    const { result } = renderHook(() =>
      useInscripcionRequisitosRapido({ inscripcionId: 10, onCerrar }),
    );
    act(() => result.current.handleToggle(1, true));
    await act(async () => {
      await result.current.handleGuardar();
    });
    expect(msg.error).toHaveBeenCalledWith('boom');
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
