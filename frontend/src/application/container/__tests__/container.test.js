import { describe, it, expect, vi } from 'vitest';
import { useCasesFactory, getUseCase, useContainer } from '@container';
import { registerAllModules } from '@container/modules';

describe('container de use cases', () => {
  const nombres = Object.keys(useCasesFactory);

  it('registra use cases de todos los módulos', () => {
    expect(nombres.length).toBeGreaterThan(50);
  });

  it('cada factory instancia un use case ejecutable sin red', () => {
    const sinEjecutar = [];
    for (const nombre of nombres) {
      const factory = useCasesFactory[nombre];
      expect(typeof factory, nombre).toBe('function');
      const instancia = factory();
      expect(instancia, nombre).toBeTruthy();
      if (typeof instancia.ejecutar !== 'function') sinEjecutar.push(nombre);
    }
    // Los use cases siguen la convención `ejecutar`; cualquier excepción se documenta aquí.
    expect(sinEjecutar).toEqual([]);
  });

  it('registerAllModules es idempotente sobre un factory nuevo', () => {
    const f = registerAllModules({});
    expect(Object.keys(f).sort()).toEqual([...nombres].sort());
  });

  it('getUseCase resuelve por nombre y avisa si no existe', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getUseCase(nombres[0])).toBeTruthy();
    expect(getUseCase('noExiste')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('useContainer.resolve delega en getUseCase', () => {
    expect(useContainer().resolve(nombres[0])).toBeTruthy();
  });
});
