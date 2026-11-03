import { describe, it, expect } from '@jest/globals';

// Los index.js solo re-exportan: importarlos asegura que ninguna ruta de import esté rota.
const indices = {
  estudiantes: () => import('../../../../src/presentation/controllers/estudiantes/index.js'),
  'estudiantes/becas': () => import('../../../../src/presentation/controllers/estudiantes/becas/index.js'),
  pasantias: () => import('../../../../src/presentation/controllers/pasantias/index.js'),
  capacitacion: () => import('../../../../src/presentation/controllers/capacitacion/index.js'),
  titulacion: () => import('../../../../src/presentation/controllers/titulacion/index.js'),
  docentes: () => import('../../../../src/presentation/controllers/docentes/index.js'),
  'docentes/supervision': () => import('../../../../src/presentation/controllers/docentes/supervision/index.js'),
};

describe('index de controllers', () => {
  it.each(Object.keys(indices))('%s exporta clases Controller', async (nombre) => {
    const mod = await indices[nombre]();
    const nombres = Object.keys(mod);
    expect(nombres.length).toBeGreaterThan(0);
    for (const n of nombres) {
      expect(typeof mod[n]).toBe('function');
      expect(n).toMatch(/Controller$/);
    }
  });
});
