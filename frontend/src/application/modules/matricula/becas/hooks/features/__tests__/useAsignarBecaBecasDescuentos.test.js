import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { api } = vi.hoisted(() => ({ api: { current: null } }));
vi.mock('@application-matricula/becas/hooks/api/useBecasDescuentosApi', () => ({
  useBecasDescuentosApi: () => api.current,
}));

import { useAsignarBecaBecasDescuentos } from '../useAsignarBecaBecasDescuentos';

const becas = [
  { id: 1, nombre: 'Excelencia', codigo: 'EX', porcentaje: 50, descripcion: 'd' },
  { id: 2, nombre: 'Hermanos', codigo: 'HE', porcentaje: 10, descripcion: 'h' },
];
const makeApi = (over = {}) => ({ becasDescuentos: becas, loading: false, error: null, refetch: vi.fn(), ...over });

describe('useAsignarBecaBecasDescuentos', () => {
  it('mantiene la referencia sin cambios de entrada y la renueva cuando cambia una', () => {
    const base = makeApi();
    api.current = base;
    const options = {};
    const { result, rerender } = renderHook(() => useAsignarBecaBecasDescuentos(options));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);

    api.current = { ...base, error: 'falló' };
    rerender();
    expect(result.current).not.toBe(first);
    expect(result.current.error).toBe('falló');
  });

  it('handleSelectBeca guarda la selección y actualiza el formulario', () => {
    api.current = makeApi();
    const form = { setFieldsValue: vi.fn() };
    const { result } = renderHook(() => useAsignarBecaBecasDescuentos({ form }));
    act(() => result.current.handleSelectBeca(becas[1]));
    expect(result.current.selectedBecaDescuento).toEqual(becas[1]);
    expect(form.setFieldsValue).toHaveBeenCalledWith({ becaDescuentoId: 2 });
  });

  it('preselecciona initialBecaDescuentoId cuando carga el catálogo', () => {
    api.current = makeApi({ becasDescuentos: [] });
    const form = { setFieldsValue: vi.fn() };
    const { result, rerender } = renderHook(() =>
      useAsignarBecaBecasDescuentos({ form, initialBecaDescuentoId: '2' }));
    expect(result.current.selectedBecaDescuento).toBeNull();
    api.current = makeApi();
    rerender();
    expect(result.current.selectedBecaDescuento?.id).toBe(2);
    expect(form.setFieldsValue).toHaveBeenCalledWith({ becaDescuentoId: 2 });
  });
});
