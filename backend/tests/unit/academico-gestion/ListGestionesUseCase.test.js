import { describe, it, expect, jest } from '@jest/globals';
import { ListGestionesUseCase } from '../../../src/application/use-cases/academico/ListGestionesUseCase.js';

describe('ListGestionesUseCase', () => {
  const crear = (result = { managements: [], total: 0 }) => {
    const deps = {
      managementRepository: { findAll: jest.fn().mockResolvedValue(result) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListGestionesUseCase(deps) };
  };

  it('expone la colección bajo dataFieldName "gestiones" con paginación', async () => {
    const { useCase, deps } = crear({
      managements: [{ id: 1, code: 'A', name: 'G1', year: 2026, vigente: true }],
      total: 25,
    });
    const res = await useCase.execute({ search: 'g' }, 2, 10);

    expect(deps.managementRepository.findAll).toHaveBeenCalledWith({ search: 'g' }, 2, 10);
    expect(res.gestiones).toEqual([expect.objectContaining({ id: 1, codigo: 'A', nombre: 'G1', anio: 2026, vigente: true })]);
    expect(res).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
  });

  it('propaga errores del repositorio y los registra', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findAll.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('boom');
    expect(deps.logger.error).toHaveBeenCalled();
  });

  describe('buildSpecificFilters', () => {
    const { useCase } = crear();

    it.each([
      ['1', true], [1, true], [true, true], ['0', false], [0, false],
    ])('vigente=%p -> %p', (v, esperado) => {
      expect(useCase.buildSpecificFilters({ vigente: v }, {}).vigente).toBe(esperado);
    });

    it('ignora vigente vacío y conserva filtros base', () => {
      expect(useCase.buildSpecificFilters({ vigente: '' }, { search: 'x' })).toEqual({ search: 'x' });
    });

    it('interpreta filtros JSON', () => {
      const f = useCase.buildSpecificFilters(
        { filtros: '{"active":true,"vigente":false,"year":"2026","type":"REGULAR"}' },
        {},
      );
      expect(f).toEqual({ isActive: true, vigente: false, year: 2026, type: 'REGULAR' });
    });

    it('acepta filtros ya parseados como objeto', () => {
      expect(useCase.buildSpecificFilters({ filtros: { isActive: 0 } }, {})).toEqual({ isActive: false });
    });

    it('JSON inválido: registra aviso y no lanza', () => {
      const { useCase: uc, deps } = crear();
      expect(uc.buildSpecificFilters({ filtros: '{no-json' }, { a: 1 })).toEqual({ a: 1 });
      expect(deps.logger.warn).toHaveBeenCalled();
    });
  });

  describe('buildSpecificFilters (Bloque 4)', () => {
    const { useCase } = crear();

    it.each([['true', true], ['false', false], ['1', true], ['0', false], [true, true]])('?vigente=%p => %p', (v, esperado) => {
      expect(useCase.buildSpecificFilters({ vigente: v }).vigente).toBe(esperado);
    });

    it('?vigente basura => ValidationError; vacío se ignora', () => {
      expect(() => useCase.buildSpecificFilters({ vigente: 'quizas' })).toThrow(/vigente/);
      expect(useCase.buildSpecificFilters({ vigente: '' })).toEqual({});
    });

    it('filtros JSON: booleanos estrictos ("false" no es true) y year válido', () => {
      const f = useCase.buildSpecificFilters({ filtros: JSON.stringify({ vigente: 'false', active: true, year: '2026', type: 'REGULAR' }) });
      expect(f).toEqual({ vigente: false, isActive: true, year: 2026, type: 'REGULAR' });
      expect(() => useCase.buildSpecificFilters({ filtros: JSON.stringify({ year: 'abc' }) })).toThrow(/year/);
      expect(() => useCase.buildSpecificFilters({ filtros: JSON.stringify({ vigente: 'zzz' }) })).toThrow(/vigente/);
    });

    it('JSON malformado se ignora con aviso', () => {
      expect(useCase.buildSpecificFilters({ filtros: '{no' })).toEqual({});
    });
  });
});
