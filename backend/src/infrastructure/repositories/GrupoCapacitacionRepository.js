import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { GrupoCapacitacion as GrupoCapacitacionModel } from '../database/models/grupo_capacitacion.js';

/**
 * Repositorio CRUD de grupos de un curso de capacitación (`capacitacion_grupos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. La sincronización de los grupos de un curso la decide el use
 * case; aquí solo persistencia y lecturas.
 *
 * @implements {IGrupoCapacitacionRepository}
 */
export class GrupoCapacitacionRepository extends BaseRepository {
  getModel() {
    return GrupoCapacitacionModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      capacitacionId: v.capacitacionId ?? null,
      nombre: v.nombre ?? null,
      cupoMaximo: v.cupoMaximo ?? null,
      costoMatricula:
        v.costoMatricula !== undefined && v.costoMatricula !== null ? Number(v.costoMatricula) : null,
      aulaId: v.aulaId ?? null,
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
    return ['nombre'];
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
    if ('nombre' in data) model.nombre = data.nombre;
    if ('cupoMaximo' in data) model.cupoMaximo = data.cupoMaximo ?? null;
    if ('costoMatricula' in data) model.costoMatricula = data.costoMatricula ?? null;
    if ('aulaId' in data) model.aulaId = data.aulaId ?? null;
    if ('orden' in data) model.orden = data.orden;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // El grupo nunca cambia de curso
    delete model.capacitacionId;
    return model;
  }

  getCollectionName() {
    return 'gruposCapacitacion';
  }

  /**
   * Grupos vigentes de un curso, en orden de presentación.
   *
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findByCapacitacionId(capacitacionId, options = {}) {
    const rows = await GrupoCapacitacionModel.findAll({
      where: { capacitacionId, activo: true },
      order: this.getDefaultSort(),
      transaction: options.transaction,
    });
    return rows.map((row) => this.toEntity(row));
  }

  /**
   * Baja lógica (activo=false + deleted_at) de varios grupos a la vez.
   *
   * @param {number[]} ids
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async softDeleteByIds(ids, userId = null, options = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    await GrupoCapacitacionModel.update(
      { activo: false, deletedBy: userId ?? null },
      { where: { id: ids }, transaction: options.transaction }
    );
    await GrupoCapacitacionModel.destroy({ where: { id: ids }, transaction: options.transaction });
  }

  /**
   * Grupos vigentes de un curso con su cantidad de inscripciones vigentes
   * (PENDIENTE o INSCRITO). Filas camelCase.
   *
   * @param {number} capacitacionId
   * @returns {Promise<Array<Object>>}
   */
  async findConInscritosByCapacitacionId(capacitacionId) {
    const rows = await sequelize.query(
      `SELECT
         g.id, g.nombre, g.cupo_maximo AS cupoMaximo, g.costo_matricula AS costoMatricula, g.orden,
         g.aula_id AS aulaId, a.codigo AS aulaCodigo, a.nombre AS aulaNombre,
         (SELECT COUNT(*)
            FROM capacitacion_inscritos ci
           WHERE ci.capacitacion_grupo_id = g.id
             AND ci.estado IN ('PENDIENTE', 'INSCRITO')
             AND ci.activo = TRUE
             AND ci.deleted_at IS NULL) AS inscritosCount
       FROM capacitacion_grupos g
       LEFT JOIN aulas a ON a.id = g.aula_id AND a.deleted_at IS NULL
       WHERE g.capacitacion_id = :capacitacionId
         AND g.activo = TRUE
         AND g.deleted_at IS NULL
       ORDER BY g.orden ASC, g.id ASC`,
      { replacements: { capacitacionId }, type: sequelize.QueryTypes.SELECT }
    );
    return rows.map((row) => ({
      ...row,
      costoMatricula: row.costoMatricula === null ? null : Number(row.costoMatricula),
      inscritosCount: Number(row.inscritosCount ?? 0),
    }));
  }
}
