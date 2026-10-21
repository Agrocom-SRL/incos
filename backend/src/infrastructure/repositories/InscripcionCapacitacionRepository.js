import { Op, fn, col } from 'sequelize';
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
      montoObligatorio:
        v.montoObligatorio !== undefined && v.montoObligatorio !== null
          ? Number(v.montoObligatorio)
          : null,
      montoMatricula:
        v.montoMatricula !== undefined && v.montoMatricula !== null ? Number(v.montoMatricula) : 0,
      estadoPago: v.estadoPago ?? null,
      estadoPagoCurso: v.estadoPagoCurso ?? null,
      estadoPagoMatricula: v.estadoPagoMatricula ?? null,
      capacitacionGrupoId: v.capacitacionGrupoId ?? null,
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
    if (filters.capacitacionGrupoId !== undefined) {
      where.capacitacionGrupoId = filters.capacitacionGrupoId;
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
    // Snapshot inmutable (no se toca en mapDataToUpdate): protege de cambios
    // de precio posteriores al momento de la inscripción.
    if ('montoObligatorio' in data) model.montoObligatorio = data.montoObligatorio;
    if ('montoMatricula' in data) model.montoMatricula = data.montoMatricula;
    if ('estadoPago' in data) model.estadoPago = data.estadoPago;
    if ('estadoPagoCurso' in data) model.estadoPagoCurso = data.estadoPagoCurso;
    if ('estadoPagoMatricula' in data) model.estadoPagoMatricula = data.estadoPagoMatricula;
    if ('capacitacionGrupoId' in data) {
      model.capacitacionGrupoId = data.capacitacionGrupoId ?? null;
    }
    return model;
  }

  mapDataToUpdate(data) {
    const model = {};
    if ('fechaInscripcion' in data) model.fechaInscripcion = data.fechaInscripcion;
    if ('estado' in data) model.estado = data.estado;
    if ('estadoPago' in data) model.estadoPago = data.estadoPago;
    if ('estadoPagoCurso' in data) model.estadoPagoCurso = data.estadoPagoCurso;
    if ('estadoPagoMatricula' in data) model.estadoPagoMatricula = data.estadoPagoMatricula;
    return model;
  }

  getCollectionName() {
    return 'inscripcionesCapacitacion';
  }

  /**
   * Inscripción vigente (estado PENDIENTE o INSCRITO — ambas mantienen "ocupado"
   * el cupo del participante en el curso, con o sin saldo pendiente) de un
   * participante a un curso, o null.
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
        estado: {
          [Op.in]: [
            ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
            ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
          ],
        },
        activo: true,
      },
      ...options,
    });
    return this.toEntity(model);
  }

  /**
   * Cantidad de inscripciones vigentes (PENDIENTE o INSCRITO) por grupo.
   * Los grupos sin inscritos aparecen con 0.
   *
   * @param {number[]} grupoIds
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object<number, number>>} Mapa grupoId → cantidad
   */
  async countVigentesByGrupoIds(grupoIds, options = {}) {
    const conteos = Object.fromEntries((grupoIds ?? []).map((id) => [id, 0]));
    if (!grupoIds || grupoIds.length === 0) return conteos;

    const filas = await InscripcionCapacitacionModel.findAll({
      attributes: ['capacitacionGrupoId', [fn('COUNT', col('id')), 'total']],
      where: {
        capacitacionGrupoId: grupoIds,
        estado: {
          [Op.in]: [
            ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
            ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
          ],
        },
        activo: true,
      },
      group: ['capacitacionGrupoId'],
      raw: true,
      transaction: options.transaction,
    });
    filas.forEach((fila) => {
      conteos[fila.capacitacionGrupoId] = Number(fila.total);
    });
    return conteos;
  }

  /**
   * SELECT base del listado/ficha: inscripción + participante + curso +
   * agregado de pagos vigentes + compromiso "abierto" (VIGENTE/INCUMPLIDO) más
   * reciente. Filas crudas snake_case.
   *
   * Los saldos se calculan por concepto contra los snapshots
   * `ci.monto_obligatorio` (curso) y `ci.monto_matricula`, NO contra los costos
   * actuales del curso (pueden cambiar después y no deben afectar inscripciones
   * ya creadas).
   * @private
   */
  _buildListadoSelect() {
    return `
      SELECT
        ci.id,
        ci.fecha_inscripcion,
        ci.estado,
        ci.monto_obligatorio,
        ci.monto_matricula,
        ci.estado_pago,
        ci.estado_pago_curso,
        ci.estado_pago_matricula,
        ci.capacitacion_grupo_id,
        g.nombre AS grupo_nombre,
        (SELECT GROUP_CONCAT(
            bh.bloque_etiqueta
            ORDER BY bh.dia_orden, bh.hora_inicio SEPARATOR ' · ')
           FROM vista_base_cursos_capacitacion_horarios bh
          WHERE bh.grupo_id = ci.capacitacion_grupo_id) AS grupo_horarios,
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
        c.modalidad AS capacitacion_modalidad,
        c.entidad_certificadora AS capacitacion_entidad_certificadora,
        c.fecha_inicio AS capacitacion_fecha_inicio,
        c.fecha_fin AS capacitacion_fecha_fin,
        c.costo,
        COALESCE(pg.total_pagado, 0) AS total_pagado,
        COALESCE(pg.pagado_curso, 0) AS pagado_curso,
        COALESCE(pg.pagado_matricula, 0) AS pagado_matricula,
        GREATEST(0, ci.monto_obligatorio - COALESCE(pg.pagado_curso, 0)) AS saldo_curso,
        GREATEST(0, ci.monto_matricula - COALESCE(pg.pagado_matricula, 0)) AS saldo_matricula,
        COALESCE(pg.pagos_count, 0) AS pagos_count,
        (
          SELECT COUNT(*)
          FROM capacitacion_requisitos r
          LEFT JOIN capacitacion_inscrito_requisitos ir
            ON ir.capacitacion_requisito_id = r.id
            AND ir.capacitacion_inscrito_id = ci.id
            AND ir.activo = TRUE
            AND ir.deleted_at IS NULL
          WHERE r.capacitacion_id = ci.capacitacion_id
            AND r.obligatorio = TRUE
            AND r.activo = TRUE
            AND r.deleted_at IS NULL
            AND COALESCE(ir.entregado, FALSE) = FALSE
        ) AS requisitos_pendientes,
        cc.id AS compromiso_id,
        cc.fecha_compromiso AS compromiso_fecha,
        cc.estado AS compromiso_estado,
        cc.observacion AS compromiso_observacion
      FROM capacitacion_inscritos ci
      INNER JOIN participantes p
        ON p.id = ci.participante_id
        AND p.deleted_at IS NULL
      INNER JOIN capacitaciones c
        ON c.id = ci.capacitacion_id
        AND c.deleted_at IS NULL
      LEFT JOIN capacitacion_grupos g
        ON g.id = ci.capacitacion_grupo_id
      LEFT JOIN (
        SELECT
          cp.capacitacion_inscrito_id,
          SUM(cp.monto) AS total_pagado,
          SUM(CASE WHEN cp.concepto = 'CURSO' THEN cp.monto ELSE 0 END) AS pagado_curso,
          SUM(CASE WHEN cp.concepto = 'MATRICULA' THEN cp.monto ELSE 0 END) AS pagado_matricula,
          COUNT(*) AS pagos_count
        FROM capacitacion_pagos cp
        WHERE cp.activo = TRUE
          AND cp.deleted_at IS NULL
        GROUP BY cp.capacitacion_inscrito_id
      ) pg ON pg.capacitacion_inscrito_id = ci.id
      LEFT JOIN capacitacion_compromisos cc
        ON cc.capacitacion_inscrito_id = ci.id
        AND cc.estado IN ('VIGENTE', 'INCUMPLIDO')
        AND cc.activo = TRUE
        AND cc.deleted_at IS NULL
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
        '(p.ci LIKE ? OR p.nombres LIKE ? OR p.apellido_paterno LIKE ?'
          + ' OR p.apellido_materno LIKE ? OR c.titulo LIKE ?)'
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
