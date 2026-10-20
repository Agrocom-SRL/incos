import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStableApiResult } from '../useStableApiResult';

describe('useStableApiResult', () => {
  it('mantiene la referencia mientras los valores no cambian', () => {
    const data = [1, 2];
    const { result, rerender } = renderHook(
      ({ r }) => useStableApiResult(r),
      { initialProps: { r: { data, loading: false } } },
    );
    const first = result.current;
    // Objeto nuevo con los mismos valores
    rerender({ r: { data, loading: false } });
    expect(result.current).toBe(first);
  });

  it('devuelve un objeto nuevo cuando cambia alguna propiedad', () => {
    const { result, rerender } = renderHook(
      ({ r }) => useStableApiResult(r),
      { initialProps: { r: { data: null, loading: true } } },
    );
    const first = result.current;
    rerender({ r: { data: null, loading: false } });
    expect(result.current).not.toBe(first);
    expect(result.current.loading).toBe(false);
  });
});
