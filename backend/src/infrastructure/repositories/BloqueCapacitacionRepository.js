import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { BloqueCapacitacion as BloqueCapacitacionModel } from '../database/models/bloque_capacitacion.js';

/**
 * Repositorio CRUD de los bloques horarios de un curso de capacitación
 * (`capacitacion_horarios`: grupo ↔ horario del catálogo `horarios`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. La sincronización por diferencia la decide el use case.
 *
 * @implements {IBloqueCapacitacionRepository}
 */
export class BloqueCapacitacionRepository extends BaseRepository {
  getModel() {
    return BloqueCapacitacionModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      capacitacionId: v.capacitacionId ?? null,
      grupoId: v.grupoId ?? null,
      horarioId: v.horarioId ?? null,
      ordenSecuencia: v.ordenSecuencia ?? 1,
      activo: v.activo ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.capacitacionId !== undefined) where.capacitacionId = filters.capacitacionId;
    if (filters.grupoId !== undefined) where.grupoId = filters.grupoId;
    if (filters.horarioId !== undefined) where.horarioId = filters.horarioId;
    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [
      ['ordenSecuencia', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('capacitacionId' in data) model.capacitacionId = data.capacitacionId;
    if ('grupoId' in data) model.grupoId = data.grupoId ?? null;
    if ('horarioId' in data) model.horarioId = data.horarioId;
    if ('ordenSecuencia' in data) model.ordenSecuencia = data.ordenSecuencia;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    delete model.capacitacionId;
    delete model.grupoId;
    delete model.horarioId;
    return model;
  }

  getCollectionName() {
    return 'bloquesCapacitacion';
  }

  /**
   * Bloques vigentes de un curso (de todos sus grupos), en orden de secuencia.
   *
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(capacitacionId, options = {}) {
    const rows = await BloqueCapacitacionModel.findAll({
      where: { capacitacionId, activo: true },
      order: this.getDefaultSort(),
      transaction: options.transaction,
    });
    return rows.map((row) => this.toEntity(row));
  }

  /**
   * Baja lógica (activo=false + deleted_at) de varios bloques a la vez.
   *
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(ids, userId = null, options = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    await BloqueCapacitacionModel.update(
      { activo: false, deletedBy: userId ?? null },
      { where: { id: ids }, transaction: options.transaction }
    );
    await BloqueCapacitacionModel.destroy({ where: { id: ids }, transaction: options.transaction });
  }

  /**
   * Cursos de capacitación vigentes que usan un horario del catálogo
   * (id y título). Sirve para bloquear su eliminación con detalle.
   *
   * @param {number} horarioId
   * @returns {Promise<Array<{id: number, titulo: string}>>}
   */
  async findCursosQueUsanHorario(horarioId) {
    return sequelize.query(
      `SELECT DISTINCT c.id, c.titulo
       FROM capacitacion_horarios ch
       INNER JOIN capacitaciones c
         ON c.id = ch.capacitacion_id AND c.deleted_at IS NULL AND c.activo = TRUE
       WHERE ch.horario_id = :horarioId
         AND ch.deleted_at IS NULL
         AND ch.activo = TRUE
       ORDER BY c.titulo ASC`,
      { replacements: { horarioId }, type: sequelize.QueryTypes.SELECT }
    );
  }
}
