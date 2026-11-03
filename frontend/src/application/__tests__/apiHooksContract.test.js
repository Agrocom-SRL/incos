/**
 * Contrato de la capa application:
 *  1. Todo módulo se puede importar (detecta imports rotos o alias mal escritos).
 *  2. Todo hook creado con `createApiHook` apunta a un use case que existe en el
 *     contenedor y define un nombre/clave de datos coherentes.
 */
import { describe, it, expect, vi } from 'vitest';

const registro = vi.hoisted(() => []);

vi.mock('@application/utils/hooks/createApiHook', () => ({
  createApiHook: (config) => {
    registro.push(config);
    return () => ({});
  },
}));

import { useCasesFactory } from '@container';

const modulos = import.meta.glob(
  [
    '/src/application/**/*.{js,jsx}',
    '!/src/application/**/__tests__/**',
    '!/src/application/**/*.test.{js,jsx}',
  ],
  { eager: false },
);

describe('capa application', () => {
  it('todos los módulos se importan sin error', async () => {
    const fallos = [];
    for (const [ruta, cargar] of Object.entries(modulos)) {
      try {
        await cargar();
      } catch (e) {
        fallos.push(`${ruta}: ${e.message}`);
      }
    }
    expect(fallos).toEqual([]);
  }, 120000);

  it('cada createApiHook usa un use case registrado en el contenedor', async () => {
    await Promise.all(Object.values(modulos).map((cargar) => cargar().catch(() => null)));
    expect(registro.length).toBeGreaterThan(30);
    const sinUseCase = registro.filter((c) => typeof useCasesFactory[c.useCase] !== 'function');
    expect(sinUseCase.map((c) => `${c.name} -> ${c.useCase}`)).toEqual([]);
  }, 120000);

  it('cada createApiHook declara nombre, tipo válido y funciones coherentes', async () => {
    await Promise.all(Object.values(modulos).map((cargar) => cargar().catch(() => null)));
    for (const c of registro) {
      expect(typeof c.name, 'name').toBe('string');
      if (c.dataType) expect(['array', 'object'], c.name).toContain(c.dataType);
      if (c.mapper) expect(typeof c.mapper, c.name).toBe('function');
      if (c.validate) expect(typeof c.validate, c.name).toBe('function');
    }
    const nombres = registro.map((c) => c.name);
    expect(new Set(nombres).size, 'nombres de hook duplicados').toBe(nombres.length);
  }, 120000);

  it('las validaciones de entrada devuelven mensaje o null', async () => {
    await Promise.all(Object.values(modulos).map((cargar) => cargar().catch(() => null)));
    for (const c of registro.filter((x) => x.validate)) {
      const sinArgs = c.validate();
      expect(sinArgs === null || typeof sinArgs === 'string', c.name).toBe(true);
    }
  }, 120000);
});
