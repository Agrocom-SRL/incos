import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Op } from 'sequelize';
import { BaseRepository } from '../../../../src/infrastructure/repositories/BaseRepository.js';
import { sequelize } from '../../../../src/infrastructure/database/sequelize.js';

const Modelo = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

class RepoPrueba extends BaseRepository {
  getModel() {
    return Modelo;
  }
  toEntity(m) {
    return m ? { id: m.id } : null;
  }
  buildWhereClause(f) {
    return f.nombre ? { nombre: f.nombre } : {};
  }
  getSearchFields() {
    return ['nombre', 'codigo'];
  }
  mapDataToModel(d) {
    return { nombre: d.name };
  }
  mapDataToUpdate(d) {
    return { nombre: d.name };
  }
  getCollectionName() {
    return 'cosas';
  }
}

describe('BaseRepository', () => {
  let repo;
  beforeEach(() => {
    repo = new RepoPrueba();
    Object.values(Modelo).forEach((fn) => fn.mockReset());
  });

  it('los métodos abstractos sin implementar lanzan', () => {
    const base = new BaseRepository();
    expect(() => base.getModel()).toThrow('getModel');
    expect(() => base.toEntity({})).toThrow('toEntity');
    expect(() => base.mapDataToModel({})).toThrow('mapDataToModel');
    expect(() => base.mapDataToUpdate({})).toThrow('mapDataToUpdate');
    expect(() => base.getCollectionName()).toThrow('getCollectionName');
    expect(base.buildWhereClause({})).toEqual({});
    expect(() => base.getSearchFields()).toThrow('getSearchFields');
    expect(base.getDefaultSort()).toEqual([['id', 'ASC']]);
  });

  it('findById ignora attributes vacíos y respeta transaction y paranoid', async () => {
    Modelo.findByPk.mockResolvedValue({ id: 2 });
    const t = { id: 't' };
    expect(await repo.findById(2, { attributes: [], transaction: t })).toEqual({ id: 2 });
    expect(Modelo.findByPk).toHaveBeenCalledWith(2, { transaction: t });
    await repo.findById(2, { paranoid: false });
    expect(Modelo.findByPk).toHaveBeenLastCalledWith(2, { paranoid: false });
  });

  it('findBy filtra por activo salvo includeInactive y usa el orden por defecto', async () => {
    Modelo.findOne.mockResolvedValue(null);
    expect(await repo.findBy({ nombre: 'x' }, { attributes: ['id'] })).toBeNull();
    expect(Modelo.findOne).toHaveBeenCalledWith({
      where: { nombre: 'x', activo: true },
      order: [['id', 'ASC']],
      attributes: ['id'],
    });
  });

  it('findAll aplica búsqueda LIKE, orden "campo:DIR" y atributos', async () => {
    Modelo.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const r = await repo.findAll({ search: 'ab', sort: 'nombre:DESC', attributes: ['id'] });
    const opts = Modelo.findAll.mock.calls[0][0];
    expect(opts.order).toEqual([['nombre', 'DESC']]);
    expect(opts.attributes).toEqual(['id']);
    expect(opts.where[Op.or]).toEqual([
      { nombre: { [Op.like]: '%ab%' } },
      { codigo: { [Op.like]: '%ab%' } },
    ]);
    expect(r).toEqual({ cosas: [{ id: 1 }, { id: 2 }], total: 2 });
    await repo.findAll({ sort: 'codigo' });
    expect(Modelo.findAll.mock.calls[1][0].order).toEqual([['codigo', 'ASC']]);
  });

  it('findAll pagina con limit/offset y devuelve total del conteo', async () => {
    Modelo.findAndCountAll.mockResolvedValue({ count: 25, rows: [{ id: 11 }] });
    const r = await repo.findAll({}, 3, 5);
    expect(Modelo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 5, offset: 10 }));
    expect(r).toEqual({ cosas: [{ id: 11 }], total: 25, page: 3, limit: 5 });
  });

  it('create arma los datos con activo por defecto, createdBy y opciones', async () => {
    Modelo.create.mockResolvedValue({ id: 9 });
    const t = {};
    expect(await repo.create({ name: 'n' }, 4, { transaction: t })).toEqual({ id: 9 });
    expect(Modelo.create).toHaveBeenCalledWith({ nombre: 'n', activo: true, createdBy: 4 }, { transaction: t });
    await repo.create({ name: 'n', active: false }, 4);
    expect(Modelo.create.mock.calls[1][0].activo).toBe(false);
    await repo.create({ name: 'n', activo: false });
    expect(Modelo.create.mock.calls[2][0]).toMatchObject({ activo: false, createdBy: null });
  });

  it('update escribe updatedBy y relee con las mismas opciones', async () => {
    Modelo.update.mockResolvedValue([1]);
    Modelo.findByPk.mockResolvedValue({ id: 7 });
    const t = { x: 1 };
    expect(await repo.update(7, { name: 'z' }, 3, { transaction: t })).toEqual({ id: 7 });
    expect(Modelo.update).toHaveBeenCalledWith({ nombre: 'z', updatedBy: 3 }, { where: { id: 7 }, transaction: t });
    expect(Modelo.findByPk).toHaveBeenCalledWith(7, { transaction: t });
  });

  it('delete hace baja lógica: inactiva, registra deletedBy y destruye', async () => {
    const destroy = jest.fn();
    Modelo.findByPk.mockResolvedValue({ id: 1, destroy });
    expect(await repo.delete(1, 8)).toBe(true);
    expect(Modelo.update).toHaveBeenCalledWith({ activo: false, deletedBy: 8 }, { where: { id: 1 } });
    expect(destroy).toHaveBeenCalled();
    await repo.delete(1);
    expect(Modelo.update).toHaveBeenLastCalledWith({ activo: false }, { where: { id: 1 } });
    Modelo.findByPk.mockResolvedValue(null);
    expect(await repo.delete(2)).toBe(false);
  });

  it('search usa límite 50 por defecto, includeInactive y atributos', async () => {
    Modelo.findAll.mockResolvedValue([{ id: 1 }]);
    expect(await repo.search('q')).toEqual([{ id: 1 }]);
    expect(Modelo.findAll.mock.calls[0][0]).toMatchObject({ limit: 50, where: { activo: true } });
    await repo.search('q', { limit: 5, includeInactive: true, attributes: ['id'] });
    const o = Modelo.findAll.mock.calls[1][0];
    expect(o.limit).toBe(5);
    expect(o.where.activo).toBeUndefined();
    expect(o.attributes).toEqual(['id']);
  });

  it('count aplica where del repositorio y activo', async () => {
    Modelo.count.mockResolvedValue(4);
    expect(await repo.count({ nombre: 'a' })).toBe(4);
    expect(Modelo.count).toHaveBeenCalledWith({ where: { nombre: 'a', activo: true } });
    await repo.count({ includeInactive: true });
    expect(Modelo.count).toHaveBeenLastCalledWith({ where: {} });
  });

  describe('_queryViewPaged', () => {
    let spy;
    beforeEach(() => {
      spy = jest.spyOn(sequelize, 'query');
    });

    it('cuenta y pagina con el mismo WHERE y acota página y límite', async () => {
      spy.mockResolvedValueOnce([{ total: '12' }]).mockResolvedValueOnce([{ a: 1 }]);
      const r = await repo._queryViewPaged('vista_x', ['a = ?', 'b = ?'], [1, 2], 'ORDER BY id', 'zz', 99999);
      expect(r).toEqual({ rows: [{ a: 1 }], total: 12 });
      expect(spy.mock.calls[0][0]).toContain('SELECT COUNT(*) AS total FROM vista_x WHERE a = ? AND b = ?');
      expect(spy.mock.calls[1][1].replacements).toEqual([1, 2, 10000, 0]);
      spy.mockRestore();
    });

    it('sin condiciones no emite WHERE y calcula el offset', async () => {
      spy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const r = await repo._queryViewPaged('vista_x', [], [], '', 3, 20);
      expect(r.total).toBe(0);
      expect(spy.mock.calls[0][0]).not.toContain('WHERE');
      expect(spy.mock.calls[1][1].replacements).toEqual([20, 40]);
      spy.mockRestore();
    });
  });
});
