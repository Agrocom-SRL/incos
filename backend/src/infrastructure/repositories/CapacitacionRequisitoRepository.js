import { BaseRepository } from './BaseRepository.js';
import { CapacitacionRequisito as CapacitacionRequisitoModel } from '../database/models/capacitacion_requisito.js';

/**
 * Repositorio CRUD de requisitos de inscripción de un curso de capacitación
 * (`capacitacion_requisitos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. La sincronización de la lista de un curso (crear/actualizar/dar
 * de baja los ausentes) la decide el use case; aquí solo persistencia.
 *
 * @implements {ICapacitacionRequisitoRepository}
 */
export class CapacitacionRequisitoRepository extends BaseRepository {
  getModel() {
    return CapacitacionRequisitoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      capacitacionId: v.capacitacionId ?? null,
      descripcion: v.descripcion ?? null,
      obligatorio: v.obligatorio !== undefined && v.obligatorio !== null ? Boolean(v.obligatorio) : true,
      acreditaPagoCurso: Boolean(v.acreditaPagoCurso),
      orden: v.orden ?? 1,
      activo: v.activo ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.capacitacionId !== undefined) where.capacitacionId = filters.capacitacionId;
    return where;
  }

  getSearchFields() {
    return ['descripcion'];
  }

  getDefaultSort() {
    return [
      ['orden', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('capacitacionId' in data) model.capacitacionId = data.capacitacionId;
    if ('descripcion' in data) model.descripcion = data.descripcion;
    if ('obligatorio' in data) model.obligatorio = data.obligatorio;
    if ('acreditaPagoCurso' in data) model.acreditaPagoCurso = Boolean(data.acreditaPagoCurso);
    if ('orden' in data) model.orden = data.orden;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // El requisito nunca cambia de curso
    delete model.capacitacionId;
    return model;
  }

  getCollectionName() {
    return 'requisitosCapacitacion';
  }

  /**
   * Requisitos vigentes de un curso, en orden de presentación.
   *
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(capacitacionId, options = {}) {
    const rows = await CapacitacionRequisitoModel.findAll({
      where: { capacitacionId, activo: true },
      order: [
        ['orden', 'ASC'],
        ['id', 'ASC'],
      ],
      transaction: options.transaction,
    });
    return rows.map((row) => this.toEntity(row));
  }

  /**
   * Baja lógica (activo=false + deleted_at) de varios requisitos a la vez.
   *
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(ids, userId = null, options = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    await CapacitacionRequisitoModel.update(
      { activo: false, deletedBy: userId ?? null },
      { where: { id: ids }, transaction: options.transaction }
    );
    await CapacitacionRequisitoModel.destroy({ where: { id: ids }, transaction: options.transaction });
  }
}
