import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { CursoCapacitacion as CursoCapacitacionModel } from '../database/models/curso_capacitacion.js';
import { BloqueCapacitacion as BloqueCapacitacionModel } from '../database/models/bloque_capacitacion.js';

/**
 * Repositorio CRUD de cursos de capacitación (tabla raíz `capacitaciones`)
 * y su junction de bloques horarios (`capacitacion_horarios`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. La junction NO tiene repositorio propio: leer/reemplazar los
 * bloques de UN curso es parte del agregado del curso (mismo criterio que la
 * ficha de paralelo_gestion con sus bloques).
 *
 * Las lecturas ricas del listado/ficha (inscritos_count, cupo_disponible,
 * horarios_detalle) viven en views/CursoCapacitacionFichaViewRepository
 * (vistas 154/155); aquí solo el CRUD.
 *
 * @implements {ICursoCapacitacionRepository}
 */
export class CursoCapacitacionRepository extends BaseRepository {
  getModel() {
    return CursoCapacitacionModel;
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
      titulo: v.titulo ?? null,
      descripcion: v.descripcion ?? null,
      costo: v.costo !== undefined && v.costo !== null ? Number(v.costo) : null,
      cupoMaximo: v.cupoMaximo ?? null,
      aulaId: v.aulaId ?? null,
      fechaInicio: v.fechaInicio ?? null,
      fechaFin: v.fechaFin ?? null,
      estado: v.estado ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.estado !== undefined) {
      where.estado = filters.estado;
    }
    if (filters.aulaId !== undefined) {
      where.aulaId = filters.aulaId;
    }
    return where;
  }

  getSearchFields() {
    return ['titulo', 'descripcion'];
  }

  getDefaultSort() {
    return [
      ['fechaInicio', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('titulo' in data) model.titulo = data.titulo;
    if ('descripcion' in data) model.descripcion = data.descripcion ?? null;
    if ('costo' in data) model.costo = data.costo;
    if ('cupoMaximo' in data) model.cupoMaximo = data.cupoMaximo;
    if ('aulaId' in data) model.aulaId = data.aulaId ?? null;
    if ('fechaInicio' in data) model.fechaInicio = data.fechaInicio;
    if ('fechaFin' in data) model.fechaFin = data.fechaFin;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // Toggle de activo (patrón PATCH /:id/estado)
    if ('activo' in data) model.activo = data.activo;
    if ('active' in data) model.activo = data.active;
    return model;
  }

  getCollectionName() {
    return 'cursosCapacitacion';
  }

  // ============================================
  // JUNCTION: capacitacion_horarios
  // ============================================

  /**
   * IDs de bloques (`horarios.id`) vigentes del curso, en orden de secuencia.
   *
   * @param {number} capacitacionId
   * @returns {Promise<number[]>}
   */
  async findHorarioIdsByCapacitacionId(capacitacionId) {
    const rows = await BloqueCapacitacionModel.findAll({
      where: { capacitacionId, activo: true },
      order: [
        ['ordenSecuencia', 'ASC'],
        ['id', 'ASC'],
      ],
      attributes: ['horarioId'],
    });
    return rows.map((row) => row.horarioId).filter((id) => id !== null);
  }

  /**
   * Reemplaza la junction de bloques del curso: soft-delete de las filas
   * vigentes y alta de las nuevas con orden_secuencia 1..n.
   * Idempotente respecto del set final de horarioIds.
   *
   * @param {number} capacitacionId
   * @param {number[]} horarioIds
   * @param {number|null} userId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async replaceHorarios(capacitacionId, horarioIds = [], userId = null, options = {}) {
    const { transaction } = options;

    // 1. Soft-delete de los bloques vigentes (activo=false + deleted_at)
    await BloqueCapacitacionModel.update(
      { activo: false, deletedBy: userId ?? null },
      { where: { capacitacionId }, transaction }
    );
    await BloqueCapacitacionModel.destroy({ where: { capacitacionId }, transaction });

    // 2. Alta de los nuevos bloques con orden secuencial 1..n
    if (Array.isArray(horarioIds) && horarioIds.length > 0) {
      const rows = horarioIds.map((horarioId, index) => ({
        capacitacionId,
        horarioId,
        ordenSecuencia: index + 1,
        activo: true,
        createdBy: userId ?? null,
      }));
      await BloqueCapacitacionModel.bulkCreate(rows, { transaction });
    }
  }

  // ============================================
  // CATÁLOGO: bloques horarios (tipo_horario='CLASES') LIBRES por aula
  // ============================================

  /**
   * Los 60 bloques `horarios` (tipo_horario='CLASES', mismo catálogo que
   * arma horarios de paralelos académicos) con un flag `ocupado` calculado
   * para un aula: choca con paralelos académicos vigentes en esa aula
   * (cadena asignacion_horarios → asignaciones_docentes → oferta_cursos →
   * paralelos_gestion.aula_id, igual que la vista 54) O con otro curso de
   * capacitación vigente en esa misma aula (capacitacion_horarios →
   * capacitaciones.aula_id), excluyendo opcionalmente el propio curso en
   * edición (`excludeCursoId`).
   *
   * Query ad-hoc parametrizada (no vista SQL): el filtro por aula + exclusión
   * del curso propio es dinámico por request.
   *
   * @param {Object} params
   * @param {number} params.aulaId - Aula a consultar (catálogo `aulas`)
   * @param {number|null} [params.excludeCursoId] - Curso a excluir (modo edición)
   * @returns {Promise<Array<Object>>} Filas camelCase con `ocupado` 0|1
   */
  async listHorariosDisponibles({ aulaId, excludeCursoId = null }) {
    const query = `
      SELECT
        h.id AS horarioId,
        h.nombre AS nombre,
        h.dia AS dia,
        h.hora_inicio AS horaInicio,
        h.hora_fin AS horaFin,
        h.turno AS turno,
        h.numero_bloque AS numeroBloque,
        CASE WHEN op.horario_id IS NOT NULL OR ocap.horario_id IS NOT NULL THEN 1 ELSE 0 END AS ocupado
      FROM horarios h
      LEFT JOIN (
        SELECT DISTINCT ah.horario_id
        FROM asignacion_horarios ah
        INNER JOIN asignaciones_docentes ad
          ON ad.id = ah.asignacion_docente_id AND ad.deleted_at IS NULL AND ad.activo = TRUE
        INNER JOIN oferta_cursos oc
          ON oc.id = ad.oferta_curso_id AND oc.deleted_at IS NULL AND oc.activo = TRUE
        INNER JOIN paralelos_gestion pg
          ON pg.id = oc.paralelo_gestion_id AND pg.deleted_at IS NULL AND pg.activo = TRUE
          AND pg.aula_id = :aulaId
        WHERE ah.deleted_at IS NULL AND ah.activo = TRUE
      ) op ON op.horario_id = h.id
      LEFT JOIN (
        SELECT DISTINCT ch.horario_id
        FROM capacitacion_horarios ch
        INNER JOIN capacitaciones c
          ON c.id = ch.capacitacion_id AND c.deleted_at IS NULL AND c.activo = TRUE
          AND c.aula_id = :aulaId
          AND (:excludeCursoId IS NULL OR c.id <> :excludeCursoId)
        WHERE ch.deleted_at IS NULL AND ch.activo = TRUE
      ) ocap ON ocap.horario_id = h.id
      WHERE h.tipo_horario = 'CLASES'
        AND h.activo = TRUE
        AND h.deleted_at IS NULL
      ORDER BY
        CASE h.dia
          WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 WHEN 'MIERCOLES' THEN 3 WHEN 'MIÉRCOLES' THEN 3
          WHEN 'JUEVES' THEN 4 WHEN 'VIERNES' THEN 5 WHEN 'SABADO' THEN 6 WHEN 'SÁBADO' THEN 6
          WHEN 'DOMINGO' THEN 7 ELSE 8
        END,
        h.hora_inicio
    `;

    return sequelize.query(query, {
      replacements: { aulaId, excludeCursoId: excludeCursoId ?? null },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
