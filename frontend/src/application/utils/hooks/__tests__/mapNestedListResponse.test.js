import { describe, it, expect } from 'vitest';
import { mapNestedListResponse } from '../mapNestedListResponse';

describe('mapNestedListResponse', () => {
  it('deja pasar resultados fallidos', () => {
    const r = { success: false, error: 'x' };
    expect(mapNestedListResponse(r)).toBe(r);
  });
  it('conserva arrays planos y su paginación', () => {
    expect(mapNestedListResponse({ success: true, data: [1] })).toEqual({ success: true, data: [1], pagination: null });
  });
  it('extrae filas por clave y arma paginación desde el payload', () => {
    const r = mapNestedListResponse({ success: true, data: { becas: [1, 2], page: 1, limit: 10, total: 2, totalPages: 1 } });
    expect(r.data).toEqual([1, 2]);
    expect(r.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });
  it('usa la clave indicada y prioriza la paginación del resultado', () => {
    const p = { page: 2 };
    expect(mapNestedListResponse({ success: true, data: { x: [9] }, pagination: p }, 'x')).toEqual({ success: true, data: [9], pagination: p });
    expect(mapNestedListResponse({ success: true, data: {} }).data).toEqual([]);
  });
});
