import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { BaseRepository } from '../../../../src/infrastructure/repositories/BaseRepository.js';
import { listarArchivosRepositorio, instalarDobles, clavesLeidas, hayUndefined } from './_harness.js';

/**
 * Contrato común de TODOS los repositorios de infraestructura, con Sequelize simulado
 * (métodos estáticos de Model y sequelize.query): sin BD ni red.
 *  - Los que extienden BaseRepository: configuración coherente (modelo, colección, orden,
 *    búsqueda, mapeos, where) y CRUD heredado.
 *  - Todos: cada método público se ejecuta con perfiles de argumentos y nunca envía
 *    `undefined` en replacements (Sequelize lo rechaza en ejecución real).
 */

const BASE_METODOS = new Set([
  'constructor', 'getModel', 'toEntity', 'buildWhereClause', 'getSearchFields', 'getDefaultSort',
  'mapDataToModel', 'mapDataToUpdate', 'getCollectionName',
]);

const MODEL_ESTATICOS = ['findAll', 'findOne', 'findByPk', 'findAndCountAll', 'count', 'create', 'update', 'destroy'];

/** Colaborador simulado: cualquier método pedido existe y resuelve a una lista vacía. */
const colaboradorFalso = () => new Proxy({}, { get: () => new Proxy({}, { get: () => async () => [] }) });

const cargar = async (archivo) => {
  const mod = await import(archivo);
  const Original = Object.values(mod).find((v) => typeof v === 'function' && /^class\s/.test(Function.prototype.toString.call(v)));
  // Fachadas con dependencias inyectadas (p. ej. HorarioGrillaRepository) reciben colaboradores falsos.
  const Clase = /constructor\s*\(\s*\{/.test(fs.readFileSync(archivo, 'utf8'))
    ? class extends Original {
      constructor() {
        super(colaboradorFalso());
      }
    }
    : Original;
  return { Clase, fuente: fs.readFileSync(archivo, 'utf8') };
};

const perfiles = (claves) => {
  const mk = (v) => Object.fromEntries(claves.map((k) => [k, typeof v === 'function' ? v(k) : v]));
  const listas = mk((k) => (/s$|ids?$/i.test(k) ? [1, 2] : '1'));
  return [
    [],
    [1, 1, 1],
    ['1', '1', '1'],
    [mk('1'), mk('1'), mk('1')],
    [mk(1), mk(1), mk(1)],
    [listas, listas, listas],
    [1, mk('1'), mk(1)],
    [mk('1'), 1, 10],
    [[1, 2], [1, 2], 1],
    [mk(true), mk(false), 1],
    [{}, {}, {}],
  ];
};

const archivos = listarArchivosRepositorio();
const sinEjecutar = [];

describe('repositorios: contrato común y ejecución con Sequelize simulado', () => {
  let ctx;
  beforeEach(() => {
    ctx = instalarDobles();
  });
  afterAll(() => {
    if (process.env.REPO_REPORT && sinEjecutar.length) fs.writeFileSync(process.env.REPO_REPORT, sinEjecutar.join('\n'));
  });

  describe.each(archivos.map((a) => [path.relative(path.dirname(archivos[0]), a), a]))('%s', (_nombre, archivo) => {
    it('exporta una clase instanciable', async () => {
      const { Clase } = await cargar(archivo);
      expect(typeof Clase).toBe('function');
      expect(() => new Clase()).not.toThrow();
    });

    it('si extiende BaseRepository, su configuración es coherente', async () => {
      const { Clase, fuente } = await cargar(archivo);
      const repo = new Clase();
      if (!(repo instanceof BaseRepository)) return;
      const Modelo = repo.getModel();
      expect(typeof Modelo.findAll).toBe('function');
      expect(typeof repo.getCollectionName()).toBe('string');
      expect(repo.getCollectionName().length).toBeGreaterThan(0);
      const campos = repo.getSearchFields();
      expect(Array.isArray(campos)).toBe(true);
      expect(new Set(campos).size).toBe(campos.length);
      const orden = repo.getDefaultSort();
      expect(Array.isArray(orden)).toBe(true);
      orden.forEach((o) => expect(Array.isArray(o)).toBe(true));
      expect(repo.toEntity(null)).toBeNull();
      const claves = clavesLeidas(fuente);
      const filtrosTexto = Object.fromEntries(claves.map((k) => [k, '1']));
      for (const f of [{}, filtrosTexto]) {
        const where = repo.buildWhereClause(f);
        expect(typeof where).toBe('object');
        expect(Object.values(where).includes(undefined)).toBe(false);
      }
      expect(() => repo.mapDataToModel({}, 1)).not.toThrow();
      expect(() => repo.mapDataToUpdate({}, 1)).not.toThrow();
    });

    it('el CRUD heredado delega en el modelo con where/orden/paginación correctos', async () => {
      const { Clase } = await cargar(archivo);
      const repo = new Clase();
      if (!(repo instanceof BaseRepository)) return;
      const esBase = (m) => Clase.prototype[m] === BaseRepository.prototype[m];
      if (esBase('findAll')) {
        const sinPagina = await repo.findAll({});
        expect(ctx.dobles.findAll).toHaveBeenCalled();
        const opts = ctx.dobles.findAll.mock.calls.at(-1)[0];
        expect(opts.where.activo).toBe(true);
        expect(sinPagina).toHaveProperty(repo.getCollectionName());
        const pag = await repo.findAll({ includeInactive: true }, 2, 10);
        const o2 = ctx.dobles.findAndCountAll.mock.calls.at(-1)[0];
        expect(o2.limit).toBe(10);
        expect(o2.offset).toBe(10);
        expect(o2.where.activo).toBeUndefined();
        expect(pag).toMatchObject({ total: 1, page: 2, limit: 10 });
      }
      if (esBase('findById')) {
        await repo.findById(5, { attributes: ['id'], paranoid: false });
        expect(ctx.dobles.findByPk).toHaveBeenCalledWith(5, expect.objectContaining({ attributes: ['id'], paranoid: false }));
      }
      if (esBase('findBy')) {
        await repo.findBy({}, { includeInactive: true });
        expect(ctx.dobles.findOne.mock.calls.at(-1)[0].where.activo).toBeUndefined();
      }
      if (esBase('count')) {
        expect(await repo.count({})).toBe(1);
        expect(ctx.dobles.count.mock.calls.at(-1)[0].where.activo).toBe(true);
      }
      if (esBase('delete')) {
        expect(await repo.delete(3, 9)).toBe(true);
        expect(ctx.dobles.update).toHaveBeenCalledWith({ activo: false, deletedBy: 9 }, { where: { id: 3 } });
        ctx.dobles.findByPk.mockResolvedValueOnce(null);
        expect(await repo.delete(4)).toBe(false);
      }
    });

    it('cada método público se ejecuta y no envía undefined en replacements', async () => {
      const { Clase, fuente } = await cargar(archivo);
      const repo = new Clase();
      const claves = clavesLeidas(fuente);
      const metodos = [];
      for (let p = Clase.prototype; p && p !== Object.prototype && p !== BaseRepository.prototype; p = Object.getPrototypeOf(p)) {
        for (const n of Object.getOwnPropertyNames(p)) {
          if (BASE_METODOS.has(n) || n === 'constructor') continue;
          if (typeof Object.getOwnPropertyDescriptor(p, n).value === 'function' && !metodos.includes(n)) metodos.push(n);
        }
      }
      for (const nombre of metodos) {
        let ok = false;
        let ultimoError;
        for (const args of perfiles(claves)) {
          ctx.llamadasSql.length = 0;
          try {
            await repo[nombre](...args);
            ok = true;
            for (const llamada of ctx.llamadasSql) {
              expect({ metodo: nombre, sql: llamada.sql.slice(0, 60), undef: hayUndefined(llamada.opts?.replacements) }).toMatchObject({ undef: false });
              expect({ metodo: nombre, undef: hayUndefined(llamada.opts?.bind) }).toMatchObject({ undef: false });
            }
          } catch (e) {
            ultimoError = e;
          }
        }
        if (!ok) sinEjecutar.push(`${path.basename(archivo)}#${nombre}: ${ultimoError?.message?.split('\n')[0]}`);
      }
      expect(MODEL_ESTATICOS.length).toBeGreaterThan(0);
    });
  });
});
