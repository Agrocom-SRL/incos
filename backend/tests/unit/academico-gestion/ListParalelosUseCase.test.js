import { describe, it, expect, jest } from '@jest/globals';
import { ListParalelosUseCase } from '../../../src/application/use-cases/academico/ListParalelosUseCase.js';

describe('ListParalelosUseCase', () => {
  const crear = ({ result = { parallels: [], total: 0 }, config = { value: '2026' }, gestion = { id: 40 }, stats = [] } = {}) => {
    const deps = {
      parallelRepository: {
        findAll: jest.fn().mockResolvedValue(result),
        obtenerEstadisticasYPeriodoPorGestion: jest.fn().mockResolvedValue(stats),
      },
      periodRepository: { findAll: jest.fn().mockResolvedValue({ periods: [{ id: 1 }, { id: 2 }] }) },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue(config) },
      managementRepository: { findBy: jest.fn().mockResolvedValue(gestion) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    };
    return { deps, useCase: new ListParalelosUseCase(deps) };
  };

  describe('buildSpecificFilters', () => {
    const { useCase } = crear();

    it('convierte periodo_id y carrera_id a número', () => {
      expect(useCase.buildSpecificFilters({ periodo_id: '4', carrera_id: '2' }, { search: 's' })).toEqual({
        search: 's', periodId: 4, careerId: 2,
      });
    });

    it.each([['true', true], [true, true], ['false', false], ['0', false]])('incluirInactivos=%p -> %p', (v, esperado) => {
      expect(useCase.buildSpecificFilters({ incluirInactivos: v }).includeInactive).toBe(esperado);
    });
  });

  describe('prepareFilters', () => {
    it('sin periodo devuelve los filtros intactos', async () => {
      const { useCase, deps } = crear();
      const f = { careerId: 1 };
      await expect(useCase.prepareFilters(f, {})).resolves.toBe(f);
      expect(deps.periodRepository.findAll).not.toHaveBeenCalled();
    });

    it('con periodo (número) resuelve los ids de periodos', async () => {
      const { useCase, deps } = crear();
      const res = await useCase.prepareFilters({ careerId: 1 }, { periodo: '3' });
      expect(deps.periodRepository.findAll).toHaveBeenCalledWith({ number: 3, attributes: ['id'] }, null, null);
      expect(res).toEqual({ careerId: 1, periodId: [1, 2] });
    });

    it('si no hay periodos con ese número, el filtro no coincide con nada', async () => {
      const { useCase, deps } = crear();
      deps.periodRepository.findAll.mockResolvedValue({ periods: [] });
      await expect(useCase.prepareFilters({}, { periodo: '9' })).resolves.toEqual({ periodId: [] });
    });
  });

  describe('execute / enrichData', () => {
    const parallels = [{ id: 1, name: 'A', shift: 'MANANA' }, { id: 2, name: 'B' }];

    it('lista bajo "paralelos" y enriquece con estadísticas del periodo vigente', async () => {
      const { useCase, deps } = crear({
        result: { parallels, total: 2 },
        stats: [
          { paralelo_id: 1, total_inscritos: '10', total_hombres: 4n, total_mujeres: 6, periodo_numero: '2', periodo_nombre: 'Segundo' },
        ],
      });
      const res = await useCase.execute({}, 1, 10, {});

      expect(deps.configuracionSistemaRepository.findBy).toHaveBeenCalledWith({ key: 'gestion_actual' });
      expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ year: 2026, vigente: true });
      expect(deps.parallelRepository.obtenerEstadisticasYPeriodoPorGestion).toHaveBeenCalledWith([1, 2], 40);
      expect(res.total).toBe(2);
      expect(res.paralelos[0]).toMatchObject({
        id: 1,
nombre: 'A',
estadisticas: { totalInscritos: 10, totalHombres: 4, totalMujeres: 6 },
        periodoNumero: 2,
periodoNombre: 'Segundo',
      });
      expect(res.paralelos[1].estadisticas).toEqual({ totalInscritos: 0, totalHombres: 0, totalMujeres: 0 });
      expect(res.paralelos[1]).not.toHaveProperty('periodoNumero');
    });

    it('sin lista no consulta configuración', async () => {
      const { useCase, deps } = crear();
      await useCase.execute({}, 1, 10, {});
      expect(deps.configuracionSistemaRepository.findBy).not.toHaveBeenCalled();
    });

    it.each([
      ['sin gestion_actual', { config: null }],
      ['gestion_actual sin valor', { config: { value: '' } }],
      ['sin gestión vigente', { gestion: null }],
    ])('estadísticas en cero cuando %s', async (_c, opts) => {
      const { useCase, deps } = crear(opts);
      const res = await useCase.enrichData([{ id: 1 }], {});
      expect(res[0].estadisticas).toEqual({ totalInscritos: 0, totalHombres: 0, totalMujeres: 0 });
      expect(deps.parallelRepository.obtenerEstadisticasYPeriodoPorGestion).not.toHaveBeenCalled();
      expect(deps.logger.warn).toHaveBeenCalled();
    });

    it('si falla el repositorio de estadísticas, devuelve ceros y registra el error', async () => {
      const { useCase, deps } = crear();
      deps.parallelRepository.obtenerEstadisticasYPeriodoPorGestion.mockRejectedValue(new Error('db'));
      const res = await useCase.enrichData([{ id: 1 }], {});
      expect(res[0].estadisticas.totalInscritos).toBe(0);
      expect(deps.logger.error).toHaveBeenCalled();
    });

    it('valores no numéricos en estadísticas se normalizan a 0', async () => {
      const { useCase } = crear({ stats: [{ paralelo_id: 1, total_inscritos: 'abc', total_hombres: null, total_mujeres: undefined }] });
      const res = await useCase.enrichData([{ id: 1 }], {});
      expect(res[0].estadisticas).toEqual({ totalInscritos: 0, totalHombres: 0, totalMujeres: 0 });
    });
  });
});
