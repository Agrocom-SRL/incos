import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
import { Model } from 'sequelize';
import { sequelize } from '../../../../src/infrastructure/database/sequelize.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const REPOS_DIR = path.resolve(aqui, '../../../../src/infrastructure/repositories');

/** Fila simulada: cualquier columna no definida es `undefined`; sirve a los mappers (toJSON/get). */
export const filaFalsa = (extra = {}) => {
  const fila = { id: 1, activo: true, total: 1, count: 1, ...extra };
  Object.defineProperty(fila, 'toJSON', { value: () => ({ ...fila }), enumerable: false });
  Object.defineProperty(fila, 'get', { value: (k) => (k ? fila[k] : { ...fila }), enumerable: false });
  Object.defineProperty(fila, 'destroy', { value: async () => {}, enumerable: false });
  Object.defineProperty(fila, 'update', { value: async () => fila, enumerable: false });
  Object.defineProperty(fila, 'save', { value: async () => fila, enumerable: false });
  return fila;
};

/** Lista los archivos de repositorio (incluye `views/`). */
export const listarArchivosRepositorio = () => {
  const out = [];
  for (const dir of [REPOS_DIR, path.join(REPOS_DIR, 'views')]) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.js') && f !== 'BaseRepository.js') out.push(path.join(dir, f));
    }
  }
  return out.sort();
};

/** Claves leídas por el repositorio (`filters.x`, `options.x`, desestructuraciones). */
export const clavesLeidas = (fuente) => {
  const claves = new Set();
  for (const m of fuente.matchAll(/\b(?:filters?|options?|opts|params|data|criteria|query|input|payload|body|dto|config|where)\??\.(\w+)/g)) claves.add(m[1]);
  for (const m of fuente.matchAll(/const\s*\{([^}]+)\}\s*=\s*(?:filters|options|opts|params|data|criteria|query|input|payload|body|dto|config)\b/g)) {
    for (const parte of m[1].split(',')) {
      const nombre = parte.split(':')[0].split('=')[0].trim();
      if (/^\w+$/.test(nombre)) claves.add(nombre);
    }
  }
  return [...claves];
};

/**
 * Sustituye los puntos de acceso a datos por dobles: métodos estáticos de Sequelize.Model
 * (heredados por todos los modelos) y `sequelize.query/transaction`. Nada toca red ni BD.
 */
export const instalarDobles = () => {
  const llamadasSql = [];
  const dobles = {
    findAll: jest.spyOn(Model, 'findAll').mockImplementation(async () => [filaFalsa()]),
    findOne: jest.spyOn(Model, 'findOne').mockImplementation(async () => filaFalsa()),
    findByPk: jest.spyOn(Model, 'findByPk').mockImplementation(async () => filaFalsa()),
    findAndCountAll: jest.spyOn(Model, 'findAndCountAll').mockImplementation(async () => ({ count: 1, rows: [filaFalsa()] })),
    count: jest.spyOn(Model, 'count').mockImplementation(async () => 1),
    create: jest.spyOn(Model, 'create').mockImplementation(async () => filaFalsa()),
    bulkCreate: jest.spyOn(Model, 'bulkCreate').mockImplementation(async (rows = []) => rows.map(() => filaFalsa())),
    update: jest.spyOn(Model, 'update').mockImplementation(async () => [1]),
    destroy: jest.spyOn(Model, 'destroy').mockImplementation(async () => 1),
    upsert: jest.spyOn(Model, 'upsert').mockImplementation(async () => [filaFalsa(), true]),
    findOrCreate: jest.spyOn(Model, 'findOrCreate').mockImplementation(async () => [filaFalsa(), true]),
    sum: jest.spyOn(Model, 'sum').mockImplementation(async () => 1),
    max: jest.spyOn(Model, 'max').mockImplementation(async () => 1),
    min: jest.spyOn(Model, 'min').mockImplementation(async () => 1),
    query: jest.spyOn(sequelize, 'query').mockImplementation(async (sql, opts) => {
      llamadasSql.push({ sql: String(sql), opts });
      return [filaFalsa()];
    }),
    transaction: jest.spyOn(sequelize, 'transaction').mockImplementation(async (a, b) => {
      const cb = typeof a === 'function' ? a : b;
      const t = { commit: async () => {}, rollback: async () => {}, LOCK: {} };
      return typeof cb === 'function' ? cb(t) : t;
    }),
  };
  return { dobles, llamadasSql };
};

/** Busca `undefined` en replacements/bind (Sequelize lo rechaza en ejecución real). */
export const hayUndefined = (valor) => {
  if (valor === undefined) return true;
  if (Array.isArray(valor)) return valor.some(hayUndefined);
  if (valor && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.values(valor).some(hayUndefined);
  }
  return false;
};
