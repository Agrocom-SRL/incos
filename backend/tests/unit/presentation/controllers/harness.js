/**
 * Arnés de pruebas para controllers: dependencias, req y res falsos (sin BD ni red).
 * Las dependencias llegan por destructuring, así que un Proxy entrega el doble correcto
 * según el nombre (`logger`, `responseFormatter`, `*UseCase`, `*Repository`, ...).
 */
import fs from 'node:fs';
import path from 'node:path';
import { jest } from '@jest/globals';

/** Valor "comodín": acepta cualquier propiedad, es invocable e iterable (vacío). */
export const comodin = () => {
  const handler = {
    get: (target, prop) => {
      if (prop === Symbol.iterator) return function* iter() {};
      if (prop === Symbol.toPrimitive) return () => 1;
      if (prop === 'then') return undefined;
      if (prop === 'length') return 0;
      if (prop === 'buffer') return Buffer.from('contenido');
      if (['fileName', 'filename', 'nombreArchivo', 'originalname'].includes(prop)) return 'archivo.bin';
      if (['mimeType', 'contentType', 'mimetype'].includes(prop)) return 'application/octet-stream';
      if (prop === 'success') return true;
      if (prop === 'id') return 1;
      return comodin();
    },
    apply: () => comodin(),
  };
  return new Proxy(function target() {}, handler);
};

export const crearLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

export const crearFormatter = () =>
  new Proxy(
    {},
    {
      get: (cache, prop) => {
        if (!cache[prop]) cache[prop] = jest.fn((res) => res);
        return cache[prop];
      },
    }
  );

/** Servicio falso: cada método es jest.fn que resuelve `resultado` o rechaza `error`. */
export const crearServicio = ({ resultado, error } = {}) => {
  const metodos = {};
  return new Proxy(metodos, {
    get: (cache, prop) => {
      if (prop === 'then') return undefined;
      if (!cache[prop]) {
        // El error se lanza de forma síncrona: cubre use cases con await y sin await.
        cache[prop] = jest.fn(() => {
          if (error) throw error;
          return Promise.resolve(resultado === undefined ? comodin() : resultado);
        });
      }
      return cache[prop];
    },
  });
};

/** Dependencias para `new Controller(deps)`; `overrides` fija dobles por nombre. */
export const crearDeps = ({ error, resultado, overrides = {} } = {}) => {
  const creados = { ...overrides };
  const logger = overrides.logger ?? crearLogger();
  const responseFormatter = overrides.responseFormatter ?? crearFormatter();
  const deps = new Proxy(creados, {
    get: (cache, prop) => {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'logger') return logger;
      if (prop === 'responseFormatter') return responseFormatter;
      if (!(prop in cache)) cache[prop] = crearServicio({ resultado, error });
      return cache[prop];
    },
    has: () => true,
  });
  return { deps, logger, responseFormatter, creados };
};

export const crearRes = () => {
  const res = {};
  for (const m of ['setHeader', 'status', 'json', 'send', 'end', 'download', 'attachment', 'type', 'set', 'redirect']) {
    res[m] = jest.fn(() => res);
  }
  return res;
};

export const crearReq = (extra = {}) => ({
  params: new Proxy({}, { get: (_t, p) => (typeof p === 'string' ? '1' : undefined) }),
  query: {},
  body: {},
  headers: {},
  usuario: { id: 7, roles: ['ADMIN'] },
  user: { id: 7 },
  ...extra,
});

/** Archivos .js (recursivo) bajo un directorio de controllers. */
export const listarArchivos = (dir) => {
  const salida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) salida.push(...listarArchivos(p));
    else if (e.name.endsWith('.js') && e.name !== 'index.js') salida.push(p);
  }
  return salida.sort();
};

/** Clases con método `handle` exportadas por un archivo de controller. */
export const cargarControllers = async (archivo) => {
  const mod = await import(archivo);
  const vistos = new Set();
  const clases = [];
  for (const [nombre, valor] of Object.entries(mod)) {
    if (typeof valor === 'function' && valor.prototype && typeof valor.prototype.handle === 'function' && !vistos.has(valor)) {
      vistos.add(valor);
      clases.push([nombre === 'default' ? valor.name : nombre, valor]);
    }
  }
  return clases;
};

/**
 * Contrato común de todo controller: camino feliz responde sin llamar a `next`,
 * y un error del use case se delega en `next` (nunca se traga ni revienta).
 * `casos[NombreClase]` permite fijar { req, resultado, overrides } cuando el comodín no basta.
 */
export const describirControllers = (describe, it, expect, dirAbs, casos = {}) => {
  for (const archivo of listarArchivos(dirAbs)) {
    const rel = path.relative(dirAbs, archivo);
    describe(rel, () => {
      let clases;
      beforeAll(async () => {
        clases = await cargarControllers(archivo);
      });
      it('camino feliz: responde y no llama a next', async () => {
        for (const [nombre, Clase] of clases) {
          const caso = casos[nombre] ?? {};
          const { deps, logger } = crearDeps({ resultado: caso.resultado, overrides: caso.overrides });
          const controller = new Clase(deps);
          const res = crearRes();
          const next = jest.fn();
          await controller.handle(crearReq(caso.req), res, next);
          expect({ nombre, next: next.mock.calls.map((c) => c[0]?.message) }).toEqual({ nombre, next: [] });
          expect(logger.error).not.toHaveBeenCalled();
        }
      });
      it('error del use case: se delega en next', async () => {
        for (const [nombre, Clase] of clases) {
          const caso = casos[nombre] ?? {};
          const error = new Error('fallo-' + nombre);
          const { deps } = crearDeps({ error, overrides: caso.overrides });
          const controller = new Clase(deps);
          const res = crearRes();
          const next = jest.fn();
          await controller.handle(crearReq(caso.req), res, next);
          expect({ nombre, llamado: next.mock.calls.length }).toEqual({ nombre, llamado: 1 });
          expect(next.mock.calls[0][0]).toBe(error);
        }
      });
    });
  }
};
