import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useServerPaginatedList } from '../useServerPaginatedList';

const okPage = (data, pagination) => ({ success: true, data, pagination });

describe('useServerPaginatedList', () => {
  it('carga la primera página al montar y normaliza la paginación', async () => {
    const fetch = vi.fn().mockResolvedValue(okPage([{ id: 1 }], { page: 1, limit: 50, total: 120 }));
    const { result } = renderHook(() => useServerPaginatedList({ fetch }));
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 1 }]));
    expect(fetch).toHaveBeenCalledWith({ params: { page: 1, limit: 50, search: undefined } });
    expect(result.current.pagination).toEqual({ current: 1, pageSize: 50, total: 120 });
    expect(result.current.tablePagination.total).toBe(120);
    expect(result.current.loading).toBe(false);
  });

  it('respuesta con success false vacía filas y expone el error', async () => {
    const fetch = vi.fn().mockResolvedValue({ success: false, error: 'Sin permiso' });
    const { result } = renderHook(() => useServerPaginatedList({ fetch }));
    await waitFor(() => expect(result.current.error).toBe('Sin permiso'));
    expect(result.current.rows).toEqual([]);
  });

  it('excepción del fetch se expone como error', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('timeout'));
    const { result } = renderHook(() => useServerPaginatedList({ fetch }));
    await waitFor(() => expect(result.current.error).toBe('timeout'));
    expect(result.current.loading).toBe(false);
  });

  it('enabled=false no llama al fetch', async () => {
    const fetch = vi.fn();
    const { result } = renderHook(() => useServerPaginatedList({ fetch, enabled: false }));
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.rows).toEqual([]);
  });

  it('onChange de la tabla pide la página indicada', async () => {
    const fetch = vi.fn().mockResolvedValue(okPage([], { page: 1, limit: 50, total: 0 }));
    const { result } = renderHook(() => useServerPaginatedList({ fetch }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await act(async () => { result.current.tablePagination.onChange(3, 20); });
    expect(fetch).toHaveBeenLastCalledWith({ params: { page: 3, limit: 20, search: undefined } });
  });

  it('cambiar el orden recarga desde página 1 con sort serializado y es idempotente', async () => {
    const fetch = vi.fn().mockResolvedValue(okPage([], { page: 1, limit: 50, total: 0 }));
    const buildRequest = vi.fn((a) => a);
    const { result } = renderHook(() => useServerPaginatedList({ fetch, buildRequest }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await act(async () => { result.current.onSortChange({ field: 'nombre', order: 'ASC' }); });
    expect(buildRequest).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, sort: 'nombre:ASC' }));
    const calls = fetch.mock.calls.length;
    await act(async () => { result.current.onSortChange({ field: 'nombre', order: 'ASC' }); });
    expect(fetch.mock.calls.length).toBe(calls);
    expect(result.current.sort).toEqual({ field: 'nombre', order: 'ASC' });
  });

  it('loadAll pide un límite alto, sin sort, y pagina en cliente', async () => {
    const fetch = vi.fn().mockResolvedValue(okPage([{ id: 1 }], { page: 1, limit: 10000, total: 1 }));
    const buildRequest = vi.fn((a) => a);
    const { result } = renderHook(() => useServerPaginatedList({ fetch, buildRequest, loadAll: true }));
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(buildRequest).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10000, sort: undefined }));
    expect(result.current.tablePagination.serverPagination).toBeUndefined();
  });

  it('descarta respuestas obsoletas (la última petición gana)', async () => {
    let resolveFirst;
    const fetch = vi.fn()
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; }))
      .mockResolvedValueOnce(okPage([{ id: 2 }], { page: 1, limit: 50, total: 1 }));
    const { result } = renderHook(() => useServerPaginatedList({ fetch }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await act(async () => { result.current.refetch(); });
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 2 }]));
    await act(async () => { resolveFirst(okPage([{ id: 1 }], { page: 1, limit: 50, total: 1 })); });
    expect(result.current.rows).toEqual([{ id: 2 }]);
  });

  describe('búsqueda con debounce', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('re-consulta solo tras el debounce y con el texto recortado', async () => {
      const fetch = vi.fn().mockResolvedValue(okPage([], { page: 1, limit: 50, total: 0 }));
      const { result } = renderHook(() => useServerPaginatedList({ fetch }));
      await act(async () => { await vi.advanceTimersByTimeAsync(500); });
      const base = fetch.mock.calls.length;
      act(() => { result.current.setSearchText('  perez '); });
      await act(async () => { await vi.advanceTimersByTimeAsync(200); });
      expect(fetch.mock.calls.length).toBe(base);
      await act(async () => { await vi.advanceTimersByTimeAsync(300); });
      expect(fetch).toHaveBeenLastCalledWith({ params: { page: 1, limit: 50, search: 'perez' } });
    });
  });
});
