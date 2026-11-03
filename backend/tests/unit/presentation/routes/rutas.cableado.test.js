import { describe, it, expect, beforeAll } from '@jest/globals';
import { instalarDobles } from '../../infrastructure/repositories/_harness.js';
import apiRouter from '../../../../src/presentation/routes/index.js';
import { aplanarRutas } from '../_helpers/routerWalker.js';

/**
 * Cableado router -> controller: ejecuta el handler final de CADA ruta real con una petición
 * mínima y Sequelize simulado. Detecta controllers no registrados en el contenedor
 * (`controllers.x` indefinido), que solo explotarían en producción al primer request.
 * No valida lógica de negocio (eso es de cada use case/controller).
 */

const resReal = () => {
  const res = { statusCode: 200, headers: {}, locals: {} };
  const chain = ['status', 'json', 'send', 'end', 'setHeader', 'set', 'type', 'attachment', 'download', 'sendFile', 'redirect', 'write', 'header', 'cookie'];
  for (const m of chain) {
    res[m] = (...a) => {
      if (m === 'status') res.statusCode = a[0];
      return res;
    };
  }
  res.on = () => res;
  res.once = () => res;
  res.emit = () => true;
  res.getHeader = () => undefined;
  return res;
};

const reqMinimo = () => ({
  params: new Proxy({}, { get: (_t, p) => (typeof p === 'string' ? '1' : undefined) }),
  query: {},
  body: {},
  headers: {},
  usuario: { id: 1, rolId: 1, rolCodigo: 'ADMIN_SISTEMA' },
  token: 't',
  get: () => undefined,
  header: () => undefined,
  ip: '127.0.0.1',
  originalUrl: '/x',
  method: 'GET',
});

const filas = aplanarRutas(apiRouter);

describe('rutas reales: cada handler final resuelve su controller', () => {
  beforeAll(() => {
    instalarDobles();
  });

  it.each(filas.map((f) => [`${f.metodo} ${f.ruta}`, f]))('%s', async (_nombre, fila) => {
    const handler = fila.handlers.at(-1);
    let errorNext = null;
    let sincrono = null;
    const terminado = new Promise((resolve) => {
      const next = (e) => {
        errorNext = e ?? null;
        resolve();
      };
      try {
        const r = handler(reqMinimo(), resReal(), next);
        Promise.resolve(r).then(
          () => setTimeout(resolve, 20),
          (e) => {
            sincrono = e;
            resolve();
          }
        );
      } catch (e) {
        sincrono = e;
        resolve();
      }
    });
    await Promise.race([terminado, new Promise((r) => setTimeout(r, 3000))]);
    const err = sincrono ?? errorNext;
    // Un controller no cableado produce "Cannot read properties of undefined (reading 'handle' ...)".
    expect(String(err?.message ?? '')).not.toMatch(/Cannot read propert(y|ies) of undefined \(reading '(handle|execute)/);
    expect(sincrono).toBeNull();
  });
});
