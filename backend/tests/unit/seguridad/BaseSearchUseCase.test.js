import { describe, it, expect, jest } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { BaseSearchUseCase } from '../../../src/application/use-cases/base/BaseSearchUseCase.js';

describe('BaseSearchUseCase', () => {
  const Mapper = { entityToPresentation: jest.fn((x) => ({ id: x.id, mapped: true })) };
  const config = (over = {}) => ({
    repository: { search: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) },
    logger: { info: jest.fn(), error: jest.fn() },
    moduleName: 'Mod',
    resourceName: 'cosa',
    ...over,
  });
  class Buscador extends BaseSearchUseCase {
    getMapper() {
      return Mapper;
    }
  }

  it.each(['repository', 'logger', 'moduleName', 'resourceName'])('falta %s: lanza', (campo) => {
    expect(() => new Buscador(config({ [campo]: undefined }))).toThrow(`${campo} es requerido`);
  });

  it('getMapper sin implementar lanza al formatear', async () => {
    await expect(new BaseSearchUseCase(config()).execute('x')).rejects.toThrow('getMapper');
  });

  it('busca con el término sin espacios y limit, y mapea cada resultado', async () => {
    const cfg = config();
    const res = await new Buscador(cfg).execute('  ana  ', 10);
    expect(cfg.repository.search).toHaveBeenCalledWith('ana', { limit: 10 });
    expect(res).toEqual([{ id: 1, mapped: true }, { id: 2, mapped: true }]);
  });

  it.each([[null], [undefined]])('término %p: ValidationError (400), no TypeError, sin consultar', async (termino) => {
    const cfg = config();
    await expect(new Buscador(cfg).execute(termino)).rejects.toBeInstanceOf(ValidationError);
    expect(cfg.repository.search).not.toHaveBeenCalled();
  });

  it('término numérico se convierte a texto', async () => {
    const cfg = config();
    await new Buscador(cfg).execute(123);
    expect(cfg.repository.search).toHaveBeenCalledWith('123', { limit: 50 });
  });

  it.each([[NaN, 50], ['abc', 50], ['5abc', 50], [0, 50], [-4, 50], [1.5, 50], [null, 50], ['7', 7], [100000, 100]])(
    'limit %p se normaliza a %p',
    async (limit, esperado) => {
      const cfg = config();
      await new Buscador(cfg).execute('ana', limit);
      expect(cfg.repository.search).toHaveBeenCalledWith('ana', { limit: esperado });
    }
  );

  it('limit por defecto 50', async () => {
    const cfg = config();
    await new Buscador(cfg).execute('x');
    expect(cfg.repository.search).toHaveBeenCalledWith('x', { limit: 50 });
  });

  it.each([[[]], [null], [undefined]])('sin resultados (%p): []', async (r) => {
    const cfg = config({ repository: { search: jest.fn().mockResolvedValue(r) } });
    expect(await new Buscador(cfg).execute('x')).toEqual([]);
  });

  it('error del repositorio: se registra y se relanza', async () => {
    const cfg = config({ repository: { search: jest.fn().mockRejectedValue(new Error('boom')) } });
    await expect(new Buscador(cfg).execute('x')).rejects.toThrow('boom');
    expect(cfg.logger.error).toHaveBeenCalled();
  });
});
