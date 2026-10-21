import { describe, it, expect, jest } from '@jest/globals';
import { BaseListUseCase } from '../../../src/application/use-cases/base/BaseListUseCase.js';

describe('BaseListUseCase', () => {
  const Mapper = { entitiesToPresentation: jest.fn((xs) => xs.map((x) => ({ ...x, mapped: true }))) };
  const config = (over = {}) => ({
    repository: { findAll: jest.fn().mockResolvedValue({ items: [{ id: 1 }], total: 45 }) },
    logger: { info: jest.fn(), error: jest.fn() },
    moduleName: 'Mod',
    resourceName: 'cosas',
    collectionFieldName: 'items',
    dataFieldName: 'cosas',
    ...over,
  });
  class Lista extends BaseListUseCase {
    getMapper() {
      return Mapper;
    }
  }

  describe('constructor', () => {
    it.each(['repository', 'logger', 'moduleName', 'resourceName', 'collectionFieldName', 'dataFieldName'])(
      'falta %s: lanza',
      (campo) => {
        expect(() => new Lista(config({ [campo]: undefined }))).toThrow(`${campo} es requerido`);
      },
    );
  });

  it('getMapper sin implementar lanza', async () => {
    await expect(new BaseListUseCase(config()).execute()).rejects.toThrow('getMapper');
  });

  it('camino feliz: pagina, mapea y expone dataFieldName', async () => {
    const cfg = config();
    const res = await new Lista(cfg).execute({ activo: true }, '2', '10');
    expect(cfg.repository.findAll).toHaveBeenCalledWith({ activo: true }, 2, 10);
    expect(res).toEqual({ cosas: [{ id: 1, mapped: true }], total: 45, page: 2, limit: 10, totalPages: 5 });
  });

  it('valores por defecto: page 1, limit 50', async () => {
    const cfg = config();
    await new Lista(cfg).execute();
    expect(cfg.repository.findAll).toHaveBeenCalledWith({}, 1, 50);
  });

  it.each([[NaN], ['abc'], [0], [null], [undefined]])('page/limit %p no numérico cae al valor por defecto', async (v) => {
    const cfg = config();
    await new Lista(cfg).execute({}, v, v);
    expect(cfg.repository.findAll).toHaveBeenCalledWith({}, 1, 50);
  });

  it.each([[-3, 1], ['-3', 1], ['5abc', 1], [1.5, 1], [Infinity, 1], ['2', 2]])('page %p se normaliza a %p', async (page, esperado) => {
    const cfg = config();
    await new Lista(cfg).execute({}, page, 10);
    expect(cfg.repository.findAll).toHaveBeenCalledWith({}, esperado, 10);
  });

  it.each([[-10, 50], ['-10', 50], ['5abc', 50], [2.5, 50], [100000, 10000], ['25', 25]])('limit %p se normaliza a %p', async (limit, esperado) => {
    const cfg = config();
    await new Lista(cfg).execute({}, 1, limit);
    expect(cfg.repository.findAll).toHaveBeenCalledWith({}, 1, esperado);
  });

  it('con page/limit negativos totalPages nunca es negativo', async () => {
    const cfg = config();
    const res = await new Lista(cfg).execute({}, -2, -5);
    expect(res.page).toBe(1);
    expect(res.limit).toBe(50);
    expect(res.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('colección ausente en el resultado: lista vacía', async () => {
    const cfg = config({ repository: { findAll: jest.fn().mockResolvedValue({ total: 0 }) } });
    const res = await new Lista(cfg).execute();
    expect(res.cosas).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('usa buildSpecificFilters solo si hay queryParams, y luego prepareFilters', async () => {
    const cfg = config();
    class Con extends Lista {
      buildSpecificFilters(q, base) {
        return { ...base, nombre: q.nombre };
      }

      async prepareFilters(f) {
        return { ...f, preparado: true };
      }
    }
    await new Con(cfg).execute({ a: 1 }, 1, 5, { nombre: 'x' });
    expect(cfg.repository.findAll).toHaveBeenLastCalledWith({ a: 1, nombre: 'x', preparado: true }, 1, 5);
    await new Con(cfg).execute({ a: 1 }, 1, 5);
    expect(cfg.repository.findAll).toHaveBeenLastCalledWith({ a: 1, preparado: true }, 1, 5);
  });

  it('enrichData puede transformar los datos', async () => {
    class Rico extends Lista {
      async enrichData(data) {
        return data.map((d) => ({ ...d, extra: 1 }));
      }
    }
    const res = await new Rico(config()).execute();
    expect(res.cosas[0].extra).toBe(1);
  });

  it('error del repositorio: lo registra y lo relanza', async () => {
    const cfg = config({ repository: { findAll: jest.fn().mockRejectedValue(new Error('boom')) } });
    await expect(new Lista(cfg).execute()).rejects.toThrow('boom');
    expect(cfg.logger.error).toHaveBeenCalledWith(expect.stringContaining('Error al listar'), expect.objectContaining({ error: 'boom' }));
  });
});
