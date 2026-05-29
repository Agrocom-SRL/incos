import { QueryTypes } from 'sequelize';
import { ParaleloGestion as ParaleloGestionModel } from '../database/models/paralelo_gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelManagementMapper } from '../mappers/ParallelManagementMapper.js';
import { sequelize } from '../database/sequelize.js';

export class ParallelManagementRepository extends BaseRepository {
  getModel() {
    return ParaleloGestionModel;
  }

  toEntity(model) {
    return ParallelManagementMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.managementPlanId) where.gestionPlanId = filters.managementPlanId;
    if (filters.parallelId) where.paraleloId = filters.parallelId;
    if (filters.classroomId) where.aulaId = filters.classroomId;
    if (filters.shift) where.turno = filters.shift;
    if (filters.state) where.estado = filters.state;
    return where;
  }

  getSearchFields() {
    return ['observaciones'];
  }

  mapDataToModel(data, userId = null) {
    return ParallelManagementMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ParallelManagementMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'parallelManagements';
  }

  /**
   * Lista enriquecida para el wizard (paralelo maestro, aula, conteo oferta).
   * @param {number} managementPlanId
   */
  async findEnrichedByManagementPlanId(managementPlanId) {
    const sql = `
      SELECT
        pg.id AS id,
        pg.gestion_plan_id AS gestionPlanId,
        pg.paralelo_id AS paraleloId,
        pg.aula_id AS aulaId,
        pg.turno AS turno,
        pg.estado AS estado,
        pg.cupo_maximo AS cupoMaximo,
        pg.cupo_minimo AS cupoMinimo,
        pg.observaciones AS observaciones,
        pg.activo AS activo,
        p.nombre AS paraleloNombre,
        p.turno AS paraleloTurnoMaestro,
        p.periodo_id AS periodoId,
        a.codigo AS aulaCodigo,
        a.nombre AS aulaNombre,
        (
          SELECT COUNT(*)
          FROM oferta_cursos oc
          WHERE oc.paralelo_gestion_id = pg.id
            AND oc.deleted_at IS NULL
            AND oc.activo = TRUE
        ) AS ofertaActual
      FROM paralelos_gestion pg
      LEFT JOIN paralelos p ON p.id = pg.paralelo_id AND p.deleted_at IS NULL
      LEFT JOIN aulas a ON a.id = pg.aula_id AND a.deleted_at IS NULL
      WHERE pg.gestion_plan_id = :managementPlanId
        AND pg.deleted_at IS NULL
      ORDER BY p.nombre ASC, pg.id ASC
    `;
    return sequelize.query(sql, {
      replacements: { managementPlanId },
      type: QueryTypes.SELECT,
    });
  }

  /**
   * Detalle enriquecido de un paralelo-gestión.
   */
  async findEnrichedById(id) {
    const rows = await sequelize.query(
      `
      SELECT
        pg.id AS id,
        pg.gestion_plan_id AS gestionPlanId,
        pg.paralelo_id AS paraleloId,
        pg.aula_id AS aulaId,
        pg.turno AS turno,
        pg.estado AS estado,
        pg.cupo_maximo AS cupoMaximo,
        pg.cupo_minimo AS cupoMinimo,
        pg.observaciones AS observaciones,
        pg.activo AS activo,
        p.nombre AS paraleloNombre,
        p.turno AS paraleloTurnoMaestro,
        p.descripcion AS paraleloDescripcion,
        p.carrera_id AS carreraId,
        p.periodo_id AS periodoId,
        per.nombre AS periodoNombre,
        a.codigo AS aulaCodigo,
        a.nombre AS aulaNombre,
        gp.plan_estudio_id AS planEstudioId,
        gp.gestion_id AS gestionId
      FROM paralelos_gestion pg
      LEFT JOIN paralelos p ON p.id = pg.paralelo_id
      LEFT JOIN periodos per ON per.id = p.periodo_id
      LEFT JOIN aulas a ON a.id = pg.aula_id
      LEFT JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
      WHERE pg.id = :id AND pg.deleted_at IS NULL
      LIMIT 1
      `,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  /**
   * IDs de paralelos maestros ya instanciados en un plan-gestión.
   */
  async findExistingParallelIds(managementPlanId) {
    const rows = await this.getModel().findAll({
      attributes: ['paraleloId'],
      where: {
        gestionPlanId: managementPlanId,
        deletedAt: null,
      },
      raw: true,
    });
    return rows.map((r) => r.paraleloId).filter((id) => id != null);
  }

  /**
   * Contexto para generar oferta: plan, periodo del paralelo maestro.
   */
  async findGenerationContext(parallelManagementId) {
    const rows = await sequelize.query(
      `
      SELECT
        pg.id AS parallelManagementId,
        pg.gestion_plan_id AS managementPlanId,
        gp.plan_estudio_id AS studyPlanId,
        pg.paralelo_id AS parallelId,
        p.periodo_id AS periodId
      FROM paralelos_gestion pg
      INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id AND gp.deleted_at IS NULL
      INNER JOIN paralelos p ON p.id = pg.paralelo_id AND p.deleted_at IS NULL
      WHERE pg.id = :parallelManagementId AND pg.deleted_at IS NULL
      LIMIT 1
      `,
      { replacements: { parallelManagementId }, type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  /**
   * IDs de asignaturas_plan ya ofertadas en el paralelo-gestión.
   */
  async findExistingPlanSubjectIds(parallelManagementId) {
    const rows = await sequelize.query(
      `
      SELECT asignatura_plan_id AS planSubjectId
      FROM oferta_cursos
      WHERE paralelo_gestion_id = :parallelManagementId
        AND deleted_at IS NULL
        AND activo = TRUE
      `,
      { replacements: { parallelManagementId }, type: QueryTypes.SELECT }
    );
    return rows.map((r) => Number(r.planSubjectId)).filter(Boolean);
  }

  /**
   * Instancia de paralelo maestro en un plan habilitado concreto.
   */
  async findByParallelAndManagementPlan(parallelId, managementPlanId) {
    const model = await this.getModel().findOne({
      where: {
        paraleloId: parallelId,
        gestionPlanId: managementPlanId,
        deletedAt: null,
      },
    });
    return model ? this.toEntity(model) : null;
  }
}
