import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { api } = vi.hoisted(() => ({ api: { current: null } }));
vi.mock('../../api/useAuthorizedBanksApi', () => ({ useAuthorizedBanksApi: () => api.current }));

import { usePagosRegistrarAuthorizedBanks } from '../usePagosRegistrarAuthorizedBanks';

const makeApi = (over = {}) => ({
  bancosAutorizados: [{ id: 1, nombre: 'BNB', codigo: 'B1' }],
  loading: false,
  error: null,
  refetch: vi.fn(),
  ...over,
});

describe('usePagosRegistrarAuthorizedBanks', () => {
  it('mantiene la referencia mientras no cambian las entradas y la renueva al cambiar una', () => {
    const base = makeApi();
    api.current = base;
    const { result, rerender } = renderHook(() => usePagosRegistrarAuthorizedBanks());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);

    api.current = { ...base, loading: true };
    rerender();
    expect(result.current).not.toBe(first);
    expect(result.current.loading).toBe(true);
  });

  it('onSelectBanco guarda solo id/nombre/codigo y conserva referencia si es el mismo banco', () => {
    api.current = makeApi();
    const { result } = renderHook(() => usePagosRegistrarAuthorizedBanks());
    act(() => result.current.onSelectBanco({ id: 1, nombre: 'BNB', codigo: 'B1', extra: 'x' }));
    expect(result.current.selectedBanco).toEqual({ id: 1, nombre: 'BNB', codigo: 'B1' });
    const sel = result.current.selectedBanco;
    act(() => result.current.onSelectBanco({ id: 1, nombre: 'otro' }));
    expect(result.current.selectedBanco).toBe(sel);
    act(() => result.current.onSelectBanco({ id: 2, nombre: 'BCP', codigo: 'B2' }));
    expect(result.current.selectedBanco.id).toBe(2);
  });

  it('ignora selecciones inválidas', () => {
    api.current = makeApi();
    const { result } = renderHook(() => usePagosRegistrarAuthorizedBanks());
    act(() => result.current.onSelectBanco(null));
    act(() => result.current.onSelectBanco({ nombre: 'sin id' }));
    expect(result.current.selectedBanco).toBeNull();
  });
});
