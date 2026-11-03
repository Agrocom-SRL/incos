import { jest } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Resultado genérico que devuelve cualquier caso de uso simulado. */
const baseResult = () => ({
  id: 7,
  data: [],
  items: [],
  rows: [],
  total: 0,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  buffer: Buffer.from('%PDF-fake'),
  fileName: 'archivo.pdf',
  filename: 'archivo.pdf',
  mimeType: 'application/pdf',
  contentType: 'application/pdf',
  filePath: '/tmp/no-existe.pdf',
  message: 'ok',
});

/** Cualquier propiedad no declarada (p. ej. result.curso) es un objeto con id. */
export const buildDefaultResult = () =>
  new Proxy(baseResult(), {
    get: (t, p) => (p in t || typeof p === 'symbol' ? t[p] : { id: 7, horarioId: 7 }),
  });

/** Recorre un directorio y devuelve las rutas absolutas de `*.controller.js`. */
export const listControllerFiles = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listControllerFiles(full));
    else if (entry.name.endsWith('.controller.js')) out.push(full);
  }
  return out.sort();
};

/**
 * Dependencias falsas: cualquier propiedad pedida es un caso de uso simulado.
 * Si se pasa `error`, todos los métodos de los casos de uso rechazan con él.
 */
export const buildDeps = ({ result = buildDefaultResult(), error = null } = {}) => {
  const mocks = new Map();
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
  const formatterFns = new Map();
  const responseFormatter = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (typeof prop === 'symbol') return undefined;
        if (!formatterFns.has(prop)) formatterFns.set(prop, jest.fn((res) => res));
        return formatterFns.get(prop);
      },
    },
  );
  const makeUseCase = () =>
    new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (typeof prop === 'symbol' || prop === 'then') return undefined;
          if (!mocks.has(prop)) {
            mocks.set(prop, error ? jest.fn().mockRejectedValue(error) : jest.fn().mockResolvedValue(result));
          }
          return mocks.get(prop);
        },
      },
    );
  const useCases = new Map();
  const deps = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (typeof prop === 'symbol') return undefined;
        if (prop === 'logger') return logger;
        if (prop === 'responseFormatter') return responseFormatter;
        if (!useCases.has(prop)) useCases.set(prop, makeUseCase());
        return useCases.get(prop);
      },
      has: () => true,
    },
  );
  return { deps, logger, formatterFns, mocks };
};

export const buildRes = () => {
  const res = { statusCode: 200, headersSent: false };
  for (const m of ['status', 'json', 'send', 'end', 'type', 'attachment', 'download', 'sendFile', 'write', 'set', 'header', 'setHeader', 'writeHead', 'on', 'once']) {
    res[m] = jest.fn(() => res);
  }
  return res;
};

export const buildReq = (overrides = {}) => ({
  params: new Proxy({}, { get: (_t, p) => (typeof p === 'string' ? '5' : undefined) }),
  query: {},
  body: { nombre: 'x', nombres: 'x' },
  headers: {},
  method: 'GET',
  path: '/x',
  originalUrl: '/api/v1/x',
  usuario: { id: 11, rolId: 1, roles: ['ADMIN'], docenteId: 3, estudianteId: 4 },
  user: { id: 11 },
  get: () => undefined,
  ...overrides,
});

/** Importa los módulos y devuelve las clases exportadas que terminan en Controller. */
export const loadControllers = async (dir) => {
  const result = [];
  for (const file of listControllerFiles(dir)) {
    const mod = await import(pathToFileURL(file).href);
    for (const [name, Cls] of Object.entries(mod)) {
      if (typeof Cls === 'function' && /Controller$/.test(name)) {
        result.push({ name, file: path.basename(file), Cls });
      }
    }
  }
  return result;
};

/** Ejecuta cadenas de express-validator (o middlewares) y devuelve los errores. */
export const runValidators = async (validators, reqOverrides = {}) => {
  const { validationResult } = await import('express-validator');
  const req = buildReq({ method: 'POST', ...reqOverrides });
  const res = buildRes();
  for (const v of [validators].flat(Infinity)) {
    if (typeof v.run === 'function') {
      await v.run(req);
    } else if (typeof v === 'function') {
      await new Promise((resolve) => {
        const r = v(req, res, resolve);
        if (r && typeof r.then === 'function') r.then(() => resolve());
      });
    }
  }
  return validationResult(req)
    .array()
    .map((e) => ({ path: e.path, msg: e.msg }));
};

/**
 * Ejecuta los validators sobre `{ body, query, params }` y devuelve los campos
 * con error (únicos). Lista vacía = payload válido.
 */
export const camposInvalidos = async (validators, { body = {}, query = {}, params = {} } = {}) => {
  const errores = await runValidators(validators, { body, query, params });
  return [...new Set(errores.map((e) => e.path))];
};
