import { describe, it, expect, vi } from 'vitest';
import {
  createOptimizedArraySetter,
  createOptimizedPrimitiveSetter,
  createOptimizedObjectSetter,
} from '../stateOptimization';

// Aplica el updater funcional que recibe setState y devuelve el estado resultante.
const run = (factory, prev, next) => {
  const setState = vi.fn();
  factory(setState)(next);
  return setState.mock.calls[0][0](prev);
};

describe('createOptimizedArraySetter', () => {
  it('conserva la referencia previa si el contenido es igual', () => {
    const prev = [{ a: 1 }];
    expect(run(createOptimizedArraySetter, prev, [{ a: 1 }])).toBe(prev);
  });
  it('devuelve el nuevo array si cambia contenido o longitud', () => {
    const next = [{ a: 2 }];
    expect(run(createOptimizedArraySetter, [{ a: 1 }], next)).toBe(next);
    expect(run(createOptimizedArraySetter, [], [1])).toEqual([1]);
  });
  it('mantiene el vacío previo y acepta no arrays', () => {
    const prev = [];
    expect(run(createOptimizedArraySetter, prev, [])).toBe(prev);
    expect(run(createOptimizedArraySetter, [1], null)).toBeNull();
    expect(run(createOptimizedArraySetter, null, [1])).toEqual([1]);
  });
  it('si no serializa (circular) devuelve el nuevo', () => {
    const a = {};
    a.self = a;
    const b = {};
    b.self = b;
    expect(run(createOptimizedArraySetter, [a], [b])[0]).toBe(b);
  });
});

describe('primitive/object setters', () => {
  it('no cambian el estado si el valor es idéntico', () => {
    expect(run(createOptimizedPrimitiveSetter, 3, 3)).toBe(3);
    expect(run(createOptimizedPrimitiveSetter, 3, 4)).toBe(4);
    const o = {};
    expect(run(createOptimizedObjectSetter, o, o)).toBe(o);
    expect(run(createOptimizedObjectSetter, o, { x: 1 })).toEqual({ x: 1 });
  });
});
