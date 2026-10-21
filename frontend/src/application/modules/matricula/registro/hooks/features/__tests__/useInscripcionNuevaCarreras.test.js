import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { api } = vi.hoisted(() => ({ api: { current: null } }));
vi.mock('@application-configuracion/academico/hooks', () => ({ useCarrerasApi: () => api.current }));

import { useInscripcionNuevaCarreras } from '../useInscripcionNuevaCarreras';

const carreras = [
  { id: 1, nombre: 'Enfermería', codigo: 'ENF' },
  { id: 2, nombre: 'Contaduría', codigo: 'CON' },
];
const makeApi = (over = {}) => ({ carreras, loading: false, error: null, refetch: vi.fn(), ...over });

describe('useInscripcionNuevaCarreras', () => {
  it('mantiene la referencia sin cambios de entrada y la renueva cuando cambia una', () => {
    const base = makeApi();
    api.current = base;
    const { result, rerender } = renderHook(() => useInscripcionNuevaCarreras());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);

    api.current = { ...base, loading: true };
    rerender();
    expect(result.current).not.toBe(first);
  });

  it('onSelectCarrera guarda id/nombre/codigo y no cambia la referencia para la misma carrera', () => {
    api.current = makeApi();
    const { result } = renderHook(() => useInscripcionNuevaCarreras());
    act(() => result.current.onSelectCarrera({ ...carreras[0], otro: 1 }));
    expect(result.current.selectedCarrera).toEqual(carreras[0]);
    const sel = result.current.selectedCarrera;
    act(() => result.current.onSelectCarrera(carreras[0]));
    expect(result.current.selectedCarrera).toBe(sel);
  });

  it('preselecciona initialCarreraId (acepta string) cuando el catálogo carga', () => {
    api.current = makeApi({ carreras: [] });
    const { result, rerender } = renderHook(() => useInscripcionNuevaCarreras({ initialCarreraId: '2' }));
    expect(result.current.selectedCarrera).toBeNull();
    api.current = makeApi();
    rerender();
    expect(result.current.selectedCarrera).toEqual(carreras[1]);
  });

  it('no preselecciona si el id no existe en el catálogo', () => {
    api.current = makeApi();
    const { result } = renderHook(() => useInscripcionNuevaCarreras({ initialCarreraId: 99 }));
    expect(result.current.selectedCarrera).toBeNull();
  });
});
