import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
const nav = vi.hoisted(() => ({ state: null }));
const formMock = vi.hoisted(() => ({ validateFields: vi.fn() }));

vi.mock('react-router-dom', () => ({ useLocation: () => ({ state: nav.state }) }));
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: msg }) },
  Form: { useForm: () => [formMock] },
}));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionEditar } from '../useInscripcionEditar';

const inscripcion = {
  estado: 'PENDIENTE',
  capacitacionId: 1,
  capacitacionGrupoId: 5,
  participanteCi: '123',
  participanteExpedicion: 'LP',
  participanteNombres: 'ANA',
  participanteApellidoPaterno: 'PEREZ',
  participanteApellidoMaterno: null,
  participanteCelular: '71234567',
  participanteEmail: null,
};
const valoresOriginales = {
  ci: '123',
  expedicion: 'LP',
  nombres: 'ANA',
  apellidoPaterno: 'PEREZ',
  apellidoMaterno: '',
  celular: '71234567',
  email: '',
  capacitacionGrupoId: 5,
};
const cursoConGrupos = {
  id: 1,
  grupos: [
    { id: 5, nombre: 'G1', horariosLabel: '', cupoDisponible: 0 },
    { id: 6, nombre: 'G2', horariosLabel: '', cupoDisponible: 4 },
  ],
};

describe('useInscripcionEditar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.state = null;
    formMock.validateFields.mockResolvedValue(valoresOriginales);
    ctx.value = {
      inscripcion,
      actualizarInscripcion: vi.fn().mockResolvedValue({ success: true }),
      actualizandoInscripcion: false,
      cursoDetalle: cursoConGrupos,
      loadingCursoDetalle: false,
      errorCursoDetalle: null,
      cargarCursoDetalle: vi.fn(),
    };
  });

  it('abrir muestra el modal y carga los grupos del curso una vez', () => {
    ctx.value.cursoDetalle = null;
    const { result } = renderHook(() => useInscripcionEditar());
    expect(result.current.open).toBe(false);
    act(() => result.current.abrir());
    expect(result.current.open).toBe(true);
    expect(ctx.value.cargarCursoDetalle).toHaveBeenCalledTimes(1);
    expect(ctx.value.cargarCursoDetalle).toHaveBeenCalledWith(1);
  });

  it('habilita el grupo con cupo y deja el grupo actual lleno seleccionable', () => {
    const { result } = renderHook(() => useInscripcionEditar());
    expect(result.current.grupoMotivoDeshabilitado).toBeNull();
    expect(result.current.grupoOptions.map((o) => o.disabled)).toEqual([false, false]);
  });

  it('deshabilita el grupo con tooltip si la inscripción está RETIRADA', () => {
    ctx.value.inscripcion = { ...inscripcion, estado: 'RETIRADO' };
    const { result } = renderHook(() => useInscripcionEditar());
    expect(result.current.grupoMotivoDeshabilitado).toMatch(/retirada o anulada/);
  });

  it('abre solo si el listado pidió editar (state.abrirEditar) y carga la ficha', () => {
    nav.state = { abrirEditar: true };
    const { result } = renderHook(() => useInscripcionEditar());
    expect(result.current.open).toBe(true);
    act(() => result.current.cerrar());
    expect(result.current.open).toBe(false);
  });

  it('sin cambios no llama al backend', async () => {
    const { result } = renderHook(() => useInscripcionEditar());
    act(() => result.current.abrir());
    await act(async () => {
      await result.current.guardar();
    });
    expect(ctx.value.actualizarInscripcion).not.toHaveBeenCalled();
    expect(msg.info).toHaveBeenCalledWith('No hay cambios que guardar');
    expect(result.current.open).toBe(false);
  });

  it('solo envía lo que cambió y cierra al guardar', async () => {
    formMock.validateFields.mockResolvedValue({
      ...valoresOriginales,
      celular: '70000000',
      capacitacionGrupoId: 6,
    });
    const { result } = renderHook(() => useInscripcionEditar());
    act(() => result.current.abrir());
    await act(async () => {
      await result.current.guardar();
    });
    expect(ctx.value.actualizarInscripcion).toHaveBeenCalledWith({
      participante: { celular: '70000000' },
      capacitacionGrupoId: 6,
    });
    expect(msg.success).toHaveBeenCalledWith('Inscripción actualizada');
    expect(result.current.open).toBe(false);
  });

  it('con la inscripción retirada no envía el grupo', async () => {
    ctx.value.inscripcion = { ...inscripcion, estado: 'ANULADO' };
    formMock.validateFields.mockResolvedValue({ ...valoresOriginales, capacitacionGrupoId: 6, email: 'a@b.co' });
    const { result } = renderHook(() => useInscripcionEditar());
    act(() => result.current.abrir());
    await act(async () => {
      await result.current.guardar();
    });
    expect(ctx.value.actualizarInscripcion).toHaveBeenCalledWith({
      participante: { email: 'a@b.co' },
    });
  });

  it('un 409 queda en el modal abierto con el mensaje del servidor', async () => {
    ctx.value.actualizarInscripcion.mockResolvedValue({
      success: false,
      error: 'Ya existe otro participante con CI 999',
    });
    formMock.validateFields.mockResolvedValue({ ...valoresOriginales, ci: '999' });
    const { result } = renderHook(() => useInscripcionEditar());
    act(() => result.current.abrir());
    await act(async () => {
      await result.current.guardar();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.errorGuardar).toBe('Ya existe otro participante con CI 999');
    expect(msg.success).not.toHaveBeenCalled();
  });

  it('si el formulario no valida no llama al backend', async () => {
    formMock.validateFields.mockRejectedValue({ errorFields: [{}] });
    const { result } = renderHook(() => useInscripcionEditar());
    act(() => result.current.abrir());
    await act(async () => {
      await result.current.guardar();
    });
    expect(ctx.value.actualizarInscripcion).not.toHaveBeenCalled();
  });
});
