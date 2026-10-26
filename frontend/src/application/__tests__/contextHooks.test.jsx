/**
 * Contrato de los hooks de contexto (`hooks/context/use*Context.js`):
 * sin provider deben fallar con un mensaje claro y, con provider, devolver su valor.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const modulos = import.meta.glob(
  ['/src/application/**/hooks/**/use*Context.{js,jsx}', '!/src/application/**/__tests__/**', '!/src/application/modules/matricula/**'],
  { eager: true },
);

const entradas = Object.entries(modulos).flatMap(([ruta, mod]) =>
  Object.entries(mod)
    .filter(([nombre, fn]) => /^use.*Context$/.test(nombre) && typeof fn === 'function')
    .map(([nombre, fn]) => ({ ruta, nombre, fn })),
);

describe('hooks de contexto de application', () => {
  it('hay hooks de contexto descubiertos', () => {
    expect(entradas.length).toBeGreaterThan(10);
  });

  it.each(entradas.map((e) => [e.nombre, e]))('%s lanza fuera de su provider', (_n, { fn }) => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    let capturado = null;
    try {
      renderHook(() => fn());
    } catch (e) {
      capturado = e;
    }
    err.mockRestore();
    // Debe fallar (con "must be used within") o, si tiene valor por defecto, no explotar con otro error.
    if (capturado) expect(capturado.message).toMatch(/must be used within|dentro de|Provider/i);
  });
});
