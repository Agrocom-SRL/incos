import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// El container real registra todos los módulos; se simula solo el factory.
const { useCasesFactory } = vi.hoisted(() => ({ useCasesFactory: {} }));
vi.mock('@container', () => ({ useCasesFactory }));

import { createApiHook } from '../createApiHook';

const mockUseCase = (ejecutar) => {
  useCasesFactory.miCaso = vi.fn(() => ({ ejecutar }));
};

describe('createApiHook', () => {
  beforeEach(() => {
    Object.keys(useCasesFactory).forEach((k) => delete useCasesFactory[k]);
  });

  it('expone estado inicial según dataType y clave configurable', () => {
    mockUseCase(vi.fn());
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array', dataKey: 'items', fetchName: 'cargar' });
    const { result } = renderHook(() => useHook());
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.cargar).toBe('function');
  });

  it('fetch exitoso aplica mapper y pasa los argumentos al use case', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, data: [{ id: 1 }] });
    mockUseCase(ejecutar);
    const useHook = createApiHook({
      name: 'h', useCase: 'miCaso', dataType: 'array',
      mapper: (d) => d.map((x) => ({ ...x, mapeado: true })),
    });
    const { result } = renderHook(() => useHook());
    let ret;
    await act(async () => { ret = await result.current.fetch(7, 'x'); });
    expect(ejecutar).toHaveBeenCalledWith(7, 'x');
    expect(ret).toEqual({ success: true, data: [{ id: 1, mapeado: true }], pagination: undefined });
    expect(result.current.data).toEqual([{ id: 1, mapeado: true }]);
    expect(result.current.loading).toBe(false);
  });

  it('resultado con success false guarda el error y resetea los datos', async () => {
    mockUseCase(vi.fn().mockResolvedValue({ success: false, error: 'Boom' }));
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array' });
    const { result } = renderHook(() => useHook());
    let ret;
    await act(async () => { ret = await result.current.fetch(); });
    expect(ret.success).toBe(false);
    expect(result.current.error).toBe(ret.error);
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toEqual([]);
  });

  it('excepción del use case se normaliza a mensaje', async () => {
    mockUseCase(vi.fn().mockRejectedValue(new Error('red caída')));
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso' });
    const { result } = renderHook(() => useHook());
    await act(async () => { await result.current.fetch(); });
    expect(result.current.error).toBe('red caída');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('validate corta antes de llamar al use case', async () => {
    const ejecutar = vi.fn();
    mockUseCase(ejecutar);
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', validate: (id) => (id ? null : 'ID requerido') });
    const { result } = renderHook(() => useHook());
    let ret;
    await act(async () => { ret = await result.current.fetch(); });
    expect(ret).toEqual({ success: false, error: 'ID requerido' });
    expect(result.current.error).toBe('ID requerido');
    expect(ejecutar).not.toHaveBeenCalled();
  });

  it('autoFetch carga al montar y refetch reutiliza autoFetchArgs', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, data: [{ id: 1 }] });
    mockUseCase(ejecutar);
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array', autoFetch: true, autoFetchArgs: ['a', 2] });
    const { result } = renderHook(() => useHook());
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
    expect(ejecutar).toHaveBeenLastCalledWith('a', 2);
    await act(async () => { await result.current.refetch(); });
    expect(ejecutar).toHaveBeenCalledTimes(2);
    expect(ejecutar).toHaveBeenLastCalledWith('a', 2);
    await act(async () => { await result.current.refetch('otro'); });
    expect(ejecutar).toHaveBeenLastCalledWith('otro');
  });

  it('expone paginación cuando paginationKey está configurado', async () => {
    mockUseCase(vi.fn().mockResolvedValue({ success: true, data: [1], pagination: { total: 9 } }));
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array', paginationKey: 'pagination' });
    const { result } = renderHook(() => useHook());
    expect(result.current.pagination).toBeNull();
    await act(async () => { await result.current.fetch(); });
    expect(result.current.pagination).toEqual({ total: 9 });
  });

  it('mantiene la referencia del resultado entre renders sin cambios', async () => {
    mockUseCase(vi.fn().mockResolvedValue({ success: true, data: [{ id: 1 }] }));
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array' });
    const { result, rerender } = renderHook(() => useHook());
    await act(async () => { await result.current.fetch(); });
    const prev = result.current;
    rerender();
    expect(result.current).toBe(prev);
  });

  it('no re-renderiza si una recarga trae el mismo contenido', async () => {
    mockUseCase(vi.fn().mockImplementation(async () => ({ success: true, data: [{ id: 1, n: 'a' }] })));
    const useHook = createApiHook({ name: 'h', useCase: 'miCaso', dataType: 'array' });
    const { result } = renderHook(() => useHook());
    await act(async () => { await result.current.fetch(); });
    const dataPrev = result.current.data;
    await act(async () => { await result.current.fetch(); });
    expect(result.current.data).toBe(dataPrev);
  });
});
