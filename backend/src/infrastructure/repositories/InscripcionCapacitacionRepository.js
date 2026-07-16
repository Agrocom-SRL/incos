import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { InscripcionCapacitacion as InscripcionCapacitacionModel } from '../database/models/inscripcion_capacitacion.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../domain/constants/capacitacion.constants.js';

/**
 * Repositorio CRUD de inscripciones a capacitaciones (`capacitacion_inscritos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. Añade las lecturas de listado/ficha que combinan inscripción +
 * participante + curso + total pagado (agregado de `capacitacion_pagos`):
 * consulta SQL directa sobre las tablas del módulo (grano fila-por-inscripción,
 * sin vista dedicada — las vistas 154/155 son del grano curso).
 *
 * @implements {IInscripcionCapacitacionRepository}
 */
export class InscripcionCapacitacionRepository extends BaseRepository {
  getModel() {
    return InscripcionCapacitacionModel;
  }

  /**
   * Convierte el modelo Sequelize a objeto de dominio (claves del contrato).
   * @param {Object|null} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      participanteId: v.participanteId ?? null,
      capacitacionId: v.capacitacionId ?? null,
      fechaInscripcion: v.fechaInscripcion ?? null,
      estado: v.estado ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.participanteId !== undefined) {
      where.participanteId = filters.participanteId;
    }
    if (filters.capacitacionId !== undefined) {
      where.capacitacionId = filters.capacitacionId;
    }
    if (filters.estado !== undefined) {
      where.estado = filters.estado;
    }
    return where;
  }

  getSearchFields() {
    return ['estado'];
  }

  getDefaultSort() {
    return [['id', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('participanteId' in data) model.participanteId = data.participanteId;
    if ('capacitacionId' in data) model.capacitacionId = data.capacitacionId;
    if ('fechaInscripcion' in data) model.fechaInscripcion = data.fechaInscripcion;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  mapDataToUpdate(data) {
    const model = {};
    if ('fechaInscripcion' in data) model.fechaInscripcion = data.fechaInscripcion;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  getCollectionName() {
    return 'inscripcionesCapacitacion';
  }

  /**
   * Inscripción activa (estado='INSCRITO') de un participante a un curso, o null.
   *
   * @param {number} participanteId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>}
   */
  async findActivaByParticipanteAndCapacitacion(participanteId, capacitacionId, options = {}) {
    const model = await InscripcionCapacitacionModel.findOne({
      where: {
        participanteId,
        capacitacionId,
        estado: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
        activo: true,
      },
      ...options,
    });
    return this.toEntity(model);
  }

  /**
   * SELECT base del listado/ficha: inscripción + participante + curso +
   * agregado de pagos vigentes. Filas crudas snake_case.
   * @private
   */
  _buildListadoSelect() {
    return `
      SELECT
        ci.id,
        ci.fecha_inscripcion,
        ci.estado,
        ci.activo,
        ci.created_at,
        p.id AS participante_id,
        p.ci AS participante_ci,
        p.expedicion AS participante_expedicion,
        p.nombres AS participante_nombres,
        p.apellido_paterno AS participante_apellido_paterno,
        p.apellido_materno AS participante_apellido_materno,
        p.celular AS participante_celular,
        p.email AS participante_email,
        c.id AS capacitacion_id,
        c.titulo AS capacitacion_titulo,
        c.estado AS capacitacion_estado,
        c.fecha_inicio AS capacitacion_fecha_inicio,
        c.fecha_fin AS capacitacion_fecha_fin,
        c.costo,
        COALESCE(pg.total_pagado, 0) AS total_pagado,
        c.costo - COALESCE(pg.total_pagado, 0) AS saldo,
        COALESCE(pg.pagos_count, 0) AS pagos_count
      FROM capacitacion_inscritos ci
      INNER JOIN participantes p
        ON p.id = ci.participante_id
        AND p.deleted_at IS NULL
      INNER JOIN capacitaciones c
        ON c.id = ci.capacitacion_id
        AND c.deleted_at IS NULL
      LEFT JOIN (
        SELECT
          cp.capacitacion_inscrito_id,
          SUM(cp.monto) AS total_pagado,
          COUNT(*) AS pagos_count
        FROM capacitacion_pagos cp
        WHERE cp.activo = TRUE
          AND cp.deleted_at IS NULL
        GROUP BY cp.capacitacion_inscrito_id
      ) pg ON pg.capacitacion_inscrito_id = ci.id
    `;
  }

  /**
   * Filas del listado de inscripciones con paginación (COUNT + SELECT con el
   * mismo WHERE, mismo criterio que _queryViewPaged).
   *
   * @param {Object} filters - { search, capacitacionId, estado, includeInactive }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListadoRows(filters = {}, page = 1, limit = 50) {
    const whereConditions = ['ci.deleted_at IS NULL'];
    const replacements = [];

    if (!filters.includeInactive) {
      whereConditions.push('ci.activo = TRUE');
    }
    if (filters.capacitacionId !== undefined && filters.capacitacionId !== null) {
      whereConditions.push('ci.capacitacion_id = ?');
      replacements.push(filters.capacitacionId);
    }
    if (filters.participanteId !== undefined && filters.participanteId !== null) {
      whereConditions.push('ci.participante_id = ?');
      replacements.push(filters.participanteId);
    }
    if (filters.estado) {
      whereConditions.push('ci.estado = ?');
      replacements.push(filters.estado);
    }
    if (filters.search) {
      whereConditions.push(
        `(p.ci LIKE ? OR p.nombres LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ? OR c.titulo LIKE ?)`
      );
      const like = `%${filters.search}%`;
      replacements.push(like, like, like, like, like);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM capacitacion_inscritos ci
      INNER JOIN participantes p ON p.id = ci.participante_id AND p.deleted_at IS NULL
      INNER JOIN capacitaciones c ON c.id = ci.capacitacion_id AND c.deleted_at IS NULL
      ${whereClause}
    `;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      ${this._buildListadoSelect()}
      ${whereClause}
      ORDER BY ci.id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de ficha de UNA inscripción (incluye inactivas), o null.
   *
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findListadoRowById(id) {
    const query = `
      ${this._buildListadoSelect()}
      WHERE ci.deleted_at IS NULL
        AND ci.id = ?
    `;
    const rows = await sequelize.query(query, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT,
    });
    return rows[0] ?? null;
  }
}
