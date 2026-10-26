import path from 'node:path';
import { describe, it, expect, jest } from '@jest/globals';
import { buildDeps, buildReq, buildRes, loadControllers } from './controllerHarness.js';

/**
 * Genera, para cada controller de un directorio, el contrato común:
 * camino feliz (responde sin propagar error) y error de dominio (next(error), sin respuesta).
 */
export const describeControllers = async (modulo, dir) => {
  const controllers = await loadControllers(dir);

  describe(`controllers de ${modulo}`, () => {
    it('descubre controllers', () => {
      expect(controllers.length).toBeGreaterThan(0);
    });

    describe.each(controllers.map((c) => [c.name, c]))('%s', (_n, { Cls }) => {
      it('camino feliz: responde y no propaga error', async () => {
        const h = buildDeps();
        const ctrl = new Cls(h.deps);
        const res = buildRes();
        const next = jest.fn();
        await ctrl.handle(buildReq(), res, next);
        const respondio =
          [...h.formatterFns.values()].some((f) => f.mock.calls.length > 0) ||
          Object.values(res).some((f) => jest.isMockFunction(f) && f.mock.calls.length > 0);
        expect(next).not.toHaveBeenCalled();
        expect(respondio).toBe(true);
      });

      it('error de dominio: delega en next(error) sin responder', async () => {
        const err = Object.assign(new Error('falla de dominio'), { statusCode: 404 });
        const h = buildDeps({ error: err });
        const ctrl = new Cls(h.deps);
        const res = buildRes();
        const next = jest.fn();
        await ctrl.handle(buildReq(), res, next);
        expect(next).toHaveBeenCalledWith(err);
        expect([...h.formatterFns.values()].every((f) => f.mock.calls.length === 0)).toBe(true);
        expect(res.send).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });
  });
};

export const controllersDir = (modulo) =>
  path.resolve(process.cwd(), 'src/presentation/controllers', modulo);
