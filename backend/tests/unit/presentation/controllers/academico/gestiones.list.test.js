import { describe, it, expect, jest } from '@jest/globals';
import { ListGestionesController } from '../../../../../src/presentation/controllers/academico/gestiones/list.controller.js';
import { crearLogger } from '../harness.js';

describe('ListGestionesController.buildFilters', () => {
  const crear = () => {
    const logger = crearLogger();
    const controller = new ListGestionesController({
      listGestionesUseCase: { execute: jest.fn() },
      logger,
      responseFormatter: { list: jest.fn() },
    });
    return { controller, logger };
  };

  it('mapea active/vigente/year/type del JSON filtros', () => {
    const { controller } = crear();
    const f = controller.buildFilters({
      filtros: JSON.stringify({ active: true, vigente: false, year: 2026, type: 'A' }),
    });
    expect(f).toMatchObject({ isActive: true, vigente: false, year: 2026, type: 'A' });
  });

  it('acepta filtros ya parseados (objeto)', () => {
    const { controller } = crear();
    expect(controller.buildFilters({ filtros: { vigente: true } })).toMatchObject({ vigente: true });
  });

  it('JSON inválido se ignora y registra advertencia', () => {
    const { controller, logger } = crear();
    expect(() => controller.buildFilters({ filtros: '{no-json' })).not.toThrow();
    expect(logger.warn).toHaveBeenCalled();
  });
});
