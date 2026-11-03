import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const uc = vi.hoisted(() => ({ obtener: vi.fn(), guardar: vi.fn() }));
vi.mock('@container', () => ({
  useCasesFactory: {
    obtenerPoliticaInstitucional: () => ({ ejecutar: uc.obtener }),
    guardarPoliticaInstitucional: () => ({ ejecutar: uc.guardar }),
  },
}));

const nav = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), isView: vi.fn() }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => nav.params,
  useNavigate: () => nav.navigate,
}));
vi.mock('@navigation/hooks/useRouteViewMode.js', () => ({ useRouteViewMode: () => ({ isView: nav.isView }) }));

const repo = vi.hoisted(() => ({ obtenerBimestreConsolidado: vi.fn(), reabrirBimestreCurso: vi.fn() }));
vi.mock('@infrastructure/repositories/CalificacionRepository.js', () => ({ default: repo }));

const ctxMock = vi.hoisted(() => ({ cargar: vi.fn() }));
vi.mock('../../utils/cargarContextoCursoRegistro.js', () => ({ cargarContextoCursoRegistro: ctxMock.cargar }));

import { useNotaAutosave } from '../useNotaAutosave';
import { usePoliticaInstitucional } from '../usePoliticaInstitucional';
import { useBimestreConsolidado } from '../useBimestreConsolidado';

describe('useNotaAutosave', () => {
  const montar = (props = {}) =>
    renderHook((p) => useNotaAutosave(p), {
      initialProps: { estudianteId: 1, evaluacionId: 2, valorInicial: 10, ...props },
    });

  it('arranca en idle con el valor inicial y sin necesidad de guardar', () => {
    const { result } = montar();
    expect(result.current.valor).toBe(10);
    expect(result.current.estado).toBe('idle');
    expect(result.current.necesitaGuardar()).toBe(false);
  });

  it('marca pendiente al cambiar y vuelve a idle si se restaura el valor', () => {
    const { result } = montar();
    act(() => result.current.setValor(15));
    expect(result.current.estado).toBe('pendiente');
    expect(result.current.necesitaGuardar()).toBe(true);
    expect(result.current.obtenerPayload()).toEqual({ estudianteId: 1, evaluacionId: 2, nota: 15 });
    act(() => result.current.setValor('10'));
    expect(result.current.estado).toBe('idle');
  });

  it('marcarGuardado consolida el valor persistido o el actual', () => {
    const { result } = montar({ valorInicial: null });
    act(() => result.current.setValor(40));
    act(() => result.current.marcarGuardado());
    expect(result.current.estado).toBe('idle');
    expect(result.current.necesitaGuardar()).toBe(false);
    act(() => result.current.marcarGuardado(null));
    expect(result.current.valor).toBeNull();
  });

  it('se reinicia al cambiar de celda y notifica el estado', () => {
    const onEstadoChange = vi.fn();
    const { result, rerender } = montar({ onEstadoChange });
    act(() => result.current.setValor(1));
    expect(onEstadoChange).toHaveBeenLastCalledWith('pendiente');
    rerender({ estudianteId: 9, evaluacionId: 2, valorInicial: 30, onEstadoChange });
    expect(result.current.valor).toBe(30);
    expect(result.current.estado).toBe('idle');
    expect(result.current.necesitaGuardar()).toBe(false);
  });
});

describe('usePoliticaInstitucional', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carga la política y la gestión vigente', async () => {
    uc.obtener.mockResolvedValue({ success: true, data: { politica: { gestionNombre: '2026' }, politicaGestionAnterior: { a: 1 } } });
    const { result } = renderHook(() => usePoliticaInstitucional());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.politica).toEqual({ gestionNombre: '2026' });
    expect(result.current.gestionVigente).toBe('2026');
    expect(result.current.politicaGestionAnterior).toEqual({ a: 1 });
    expect(result.current.breadcrumbItems).toBeTruthy();
  });

  it('expone el error si el caso de uso falla o lanza', async () => {
    uc.obtener.mockResolvedValueOnce({ success: false, error: 'sin acceso' });
    const { result } = renderHook(() => usePoliticaInstitucional());
    await waitFor(() => expect(result.current.error).toBe('sin acceso'));
    expect(result.current.politica).toBeNull();
    uc.obtener.mockRejectedValueOnce(new Error('red'));
    await act(() => result.current.refetch());
    expect(result.current.error).toBe('red');
  });

  it('guardar persiste, recarga y devuelve la política', async () => {
    uc.obtener.mockResolvedValue({ success: true, data: { politica: { p: 1 } } });
    uc.guardar.mockResolvedValue({ success: true, data: { politica: { p: 2 } } });
    const { result } = renderHook(() => usePoliticaInstitucional());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let devuelta;
    await act(async () => { devuelta = await result.current.guardar({ x: 1 }); });
    expect(uc.guardar).toHaveBeenCalledWith({ x: 1 });
    expect(devuelta).toEqual({ p: 2 });
    expect(uc.obtener).toHaveBeenCalledTimes(2);
    expect(result.current.isSaving).toBe(false);
  });

  it('guardar propaga el error y lo deja en estado', async () => {
    uc.obtener.mockResolvedValue({ success: true, data: {} });
    uc.guardar.mockResolvedValue({ success: false, error: 'inválido' });
    const { result } = renderHook(() => usePoliticaInstitucional());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await expect(result.current.guardar({})).rejects.toThrow('inválido');
    });
    expect(result.current.error).toBe('inválido');
    expect(result.current.isSaving).toBe(false);
  });
});

describe('useBimestreConsolidado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.params = { asignacionId: '7', n: '2' };
    nav.isView.mockReturnValue(false);
    ctxMock.cargar.mockResolvedValue({
      docente: { id: 1 }, curso: { materia: 'Mat' }, estudiantesBase: [], bimestreVigente: 3, bimestresCalendario: [{ numero: 2, reabierto: false }],
    });
    repo.obtenerBimestreConsolidado.mockResolvedValue({
      success: true,
      data: { bimestre: 2, cerrado: true, evaluaciones: [{ id: 1 }], estudiantes: [{ nombre: 'Zeta' }, { nombre: 'Álvarez' }] },
    });
  });

  it('carga el consolidado y numera a los estudiantes por orden alfabético', async () => {
    const { result } = renderHook(() => useBimestreConsolidado());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.estudiantes.map((e) => [e.nro, e.nombre])).toEqual([[1, 'Álvarez'], [2, 'Zeta']]);
    expect(result.current.bimestreActivo).toBe(2);
    expect(result.current.bimestreVigente).toBe(3);
    expect(result.current.cuotaTeorico).toBe(30);
    expect(result.current.cuotaPractico).toBe(70);
    expect(result.current.tituloPagina).toMatch(/^Consolidado · /);
    expect(result.current.volverPath).toContain('/7/notas');
  });

  it('bimestre fuera de rango deja error', async () => {
    nav.params = { asignacionId: '7', n: '9' };
    const { result } = renderHook(() => useBimestreConsolidado());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Bimestre inválido');
    expect(ctxMock.cargar).not.toHaveBeenCalled();
  });

  it('redirige al cuaderno si el bimestre fue reabierto', async () => {
    ctxMock.cargar.mockResolvedValue({ bimestresCalendario: [{ numero: 2, reabierto: true }] });
    renderHook(() => useBimestreConsolidado());
    await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith('/academico/calificaciones/mis-cursos/7/cuaderno/2', { replace: true }));
    expect(repo.obtenerBimestreConsolidado).not.toHaveBeenCalled();
  });

  it('vuelve a mis cursos si el curso no existe', async () => {
    ctxMock.cargar.mockRejectedValue(Object.assign(new Error('no'), { code: 'CURSO_NOT_FOUND' }));
    const { result } = renderHook(() => useBimestreConsolidado());
    await waitFor(() => expect(result.current.error).toBe('no'));
    expect(nav.navigate).toHaveBeenCalledWith('/academico/calificaciones/mis-cursos', { replace: true });
  });

  it('error del repositorio y reabrirBimestre', async () => {
    repo.obtenerBimestreConsolidado.mockResolvedValue({ success: false, error: 'falló' });
    const { result } = renderHook(() => useBimestreConsolidado());
    await waitFor(() => expect(result.current.error).toBe('falló'));
    repo.reabrirBimestreCurso.mockResolvedValueOnce({ success: true, data: { ok: 1 } });
    await expect(result.current.reabrirBimestre()).resolves.toEqual({ ok: 1 });
    expect(repo.reabrirBimestreCurso).toHaveBeenCalledWith('7', 2);
    repo.reabrirBimestreCurso.mockResolvedValueOnce({ success: false });
    await expect(result.current.reabrirBimestre()).rejects.toThrow('No se pudo reabrir el bimestre');
  });
});
