/**
 * Hooks de contexto de matrícula (`hooks/context/use*Context.js`): sin provider fallan con un
 * mensaje claro. Complementa application/__tests__/contextHooks.test.jsx, que excluye matrícula.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const modulos = import.meta.glob('/src/application/modules/matricula/**/hooks/context/use*Context*.js', { eager: true });

const entradas = Object.entries(modulos).flatMap(([ruta, mod]) =>
  Object.entries(mod)
    .filter(([nombre, fn]) => /^use.*Context/.test(nombre) && typeof fn === 'function')
    .map(([nombre, fn]) => ({ ruta, nombre, fn })),
);

describe('hooks de contexto de matrícula', () => {
  it('descubre los hooks de contexto', () => {
    expect(entradas.length).toBeGreaterThan(10);
  });

  it.each(entradas.map((e) => [e.nombre, e]))('%s lanza fuera de su provider (o devuelve nulo si es opcional)', (nombre, { fn }) => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    let capturado = null;
    let valor;
    try {
      valor = renderHook(() => fn()).result.current;
    } catch (e) {
      capturado = e;
    }
    err.mockRestore();
    if (/Optional/.test(nombre)) {
      expect(capturado).toBeNull();
      expect(valor ?? null).toBeNull();
    } else if (capturado) {
      expect(capturado.message).toMatch(/dentro de|must be used within|Provider/i);
    } else {
      // Contexto con valor por defecto (p. ej. PagosDetailContext): no explota y devuelve ese valor.
      expect(valor).toBeTruthy();
    }
  });
});
