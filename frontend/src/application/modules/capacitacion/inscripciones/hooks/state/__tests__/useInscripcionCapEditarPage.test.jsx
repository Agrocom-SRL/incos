import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));
const notif = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));

vi.mock('antd', () => ({ App: { useApp: () => ({ notification: notif }) } }));
vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => ({ state: null }),
}));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionCapEditarPage } from '../useInscripcionCapEditarPage';

const grupos = [
  { id: 5, nombre: 'Regular', cupoDisponible: 3 },
  { id: 6, nombre: 'Intensivo', cupoDisponible: 2 },
];

describe('useInscripcionCapEditarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = {
      inscripcionId: '1',
      inscripcion: { id: 1, estado: 'INSCRITO', capacitacionId: 10, capacitacionGrupoId: 5 },
      loading: false,
      actualizarInscripcion: vi.fn().mockResolvedValue({ success: true }),
      actualizandoInscripcion: false,
      cursoDetalle: { id: 10, grupos },
      loadingCursoDetalle: false,
      errorCursoDetalle: null,
      cargarCursoDetalle: vi.fn(),
    };
  });

  it('parte del grupo actual, carga los grupos del curso y no hay cambios', () => {
    const { result } = renderHook(() => useInscripcionCapEditarPage());
    expect(ctx.value.cargarCursoDetalle).toHaveBeenCalledWith(10);
    expect(result.current.grupoId).toBe(5);
    expect(result.current.hayCambios).toBe(false);
    expect(result.current.grupoMotivoDeshabilitado).toBeNull();
  });

  it('cambiar de grupo envía SOLO capacitacionGrupoId (nunca participante ni curso) y vuelve al detalle', async () => {
    const { result } = renderHook(() => useInscripcionCapEditarPage());
    act(() => result.current.handleGrupoChange(6));
    expect(result.current.hayCambios).toBe(true);
    await act(async () => {
      await result.current.handleGuardar();
    });
    expect(ctx.value.actualizarInscripcion).toHaveBeenCalledWith({ capacitacionGrupoId: 6 });
    expect(nav.navigate).toHaveBeenCalledWith('/capacitacion/inscripciones/1', expect.objectContaining({ replace: true }));
  });

  it('sin cambios no llama al backend', async () => {
    const { result } = renderHook(() => useInscripcionCapEditarPage());
    await act(async () => {
      await result.current.handleGuardar();
    });
    expect(ctx.value.actualizarInscripcion).not.toHaveBeenCalled();
    expect(notif.info).toHaveBeenCalled();
  });

  it('un error del servidor (grupo lleno) se muestra y no navega', async () => {
    ctx.value.actualizarInscripcion.mockResolvedValue({ success: false, error: 'Grupo lleno' });
    const { result } = renderHook(() => useInscripcionCapEditarPage());
    act(() => result.current.handleGrupoChange(6));
    await act(async () => {
      await result.current.handleGuardar();
    });
    expect(result.current.error).toBe('Grupo lleno');
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('una inscripción anulada no permite cambiar el grupo', () => {
    ctx.value.inscripcion.estado = 'ANULADO';
    const { result } = renderHook(() => useInscripcionCapEditarPage());
    expect(result.current.grupoMotivoDeshabilitado).toMatch(/retirada o anulada/);
  });
});
