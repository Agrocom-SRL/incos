import { QueryTypes } from 'sequelize';
import { OfertaCurso as OfertaCursoModel } from '../database/models/oferta_curso.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseOfferMapper } from '../mappers/CourseOfferMapper.js';
import { sequelize } from '../database/sequelize.js';

export class CourseOfferRepository extends BaseRepository {
  getModel() {
    return OfertaCursoModel;
  }

  toEntity(model) {
    return CourseOfferMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.parallelManagementId) where.paraleloGestionId = filters.parallelManagementId;
    if (filters.planSubjectId) where.asignaturaPlanId = filters.planSubjectId;
    if (filters.state) where.estado = filters.state;
    return where;
  }

  getSearchFields() {
    return ['observaciones'];
  }

  mapDataToModel(data, userId = null) {
    return CourseOfferMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return CourseOfferMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'courseOffers';
  }

  /**
   * Oferta de cursos con datos de asignatura y materia.
   */
  async findEnrichedByParallelManagementId(parallelManagementId) {
    const sql = `
      SELECT
        oc.id AS id,
        oc.paralelo_gestion_id AS paraleloGestionId,
        oc.asignatura_plan_id AS asignaturaPlanId,
        oc.estado AS estado,
        oc.observaciones AS observaciones,
        oc.activo AS activo,
        ap.horas_semanales AS horasSemanales,
        ap.creditos AS creditos,
        ap.periodo_id AS periodoId,
        m.id AS materiaId,
        m.nombre AS materiaNombre,
        m.sigla AS materiaCodigo
      FROM oferta_cursos oc
      LEFT JOIN asignaturas_plan ap ON ap.id = oc.asignatura_plan_id AND ap.deleted_at IS NULL
      LEFT JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL
      WHERE oc.paralelo_gestion_id = :parallelManagementId
        AND oc.deleted_at IS NULL
      ORDER BY ap.orden_visualizacion ASC, oc.id ASC
    `;
    return sequelize.query(sql, {
      replacements: { parallelManagementId },
      type: QueryTypes.SELECT,
    });
  }

  /**
   * Datos para validación de cobertura de oferta.
   */
  async findValidationBundle(parallelManagementId, studyPlanId, periodId) {
    const expectedSql = `
      SELECT
        ap.id AS asignaturaPlanId,
        ap.horas_semanales AS horasSemanales,
        m.nombre AS materiaNombre,
        m.sigla AS materiaCodigo
      FROM asignaturas_plan ap
      LEFT JOIN materias m ON m.id = ap.materia_id
      WHERE ap.plan_estudio_id = :studyPlanId
        AND ap.periodo_id = :periodId
        AND ap.deleted_at IS NULL
        AND ap.activo = TRUE
      ORDER BY ap.orden_visualizacion ASC
    `;

    const actualSql = `
      SELECT
        oc.id AS ofertaCursoId,
        oc.asignatura_plan_id AS asignaturaPlanId,
        ap.periodo_id AS periodoId,
        ap.horas_semanales AS horasSemanales,
        m.nombre AS materiaNombre,
        m.sigla AS materiaCodigo
      FROM oferta_cursos oc
      LEFT JOIN asignaturas_plan ap ON ap.id = oc.asignatura_plan_id
      LEFT JOIN materias m ON m.id = ap.materia_id
      WHERE oc.paralelo_gestion_id = :parallelManagementId
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
    `;

    const [expected, actual] = await Promise.all([
      sequelize.query(expectedSql, {
        replacements: { studyPlanId, periodId },
        type: QueryTypes.SELECT,
      }),
      sequelize.query(actualSql, {
        replacements: { parallelManagementId },
        type: QueryTypes.SELECT,
      }),
    ]);

    return { expected, actual };
  }

  /**
   * Cuenta matrículas activas vinculadas a una oferta (para restricciones futuras).
   */
  async countActiveEnrollmentsByOfferId(offerId) {
    const rows = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM matriculas_materia mm
      WHERE mm.oferta_curso_id = :offerId
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      `,
      { replacements: { offerId }, type: QueryTypes.SELECT }
    );
    return Number(rows[0]?.total ?? 0) || 0;
  }

  /**
   * Catálogo paginado de oferta_cursos de un paralelo_gestion (UI asignación docente).
   */
  async findCatalogByParallelManagementId(parallelManagementId, opts = {}) {
    const pgId = Number(parallelManagementId);
    if (!Number.isFinite(pgId) || pgId < 1) return { rows: [], total: 0 };

    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(opts.limit ?? 500), 10) || 500));
    const offset = (page - 1) * limit;

    const baseFrom = `
      FROM oferta_cursos oc
      INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
      INNER JOIN asignaturas_plan ap
        ON ap.id = oc.asignatura_plan_id
        AND ap.deleted_at IS NULL
        AND ap.activo = TRUE
      LEFT JOIN materias m
        ON m.id = ap.materia_id
        AND m.deleted_at IS NULL
      WHERE oc.paralelo_gestion_id = :parallelManagementId
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
    `;

    const countRows = await sequelize.query(
      `SELECT COUNT(*) AS total ${baseFrom}`,
      { replacements: { parallelManagementId: pgId }, type: QueryTypes.SELECT }
    );
    const total = Number(countRows[0]?.total ?? countRows[0]?.TOTAL ?? 0) || 0;

    const rows = await sequelize.query(
      `
      SELECT
        oc.id AS id,
        CONCAT('OC-', oc.id) AS codigo,
        pg.paralelo_id AS paraleloId,
        oc.asignatura_plan_id AS asignaturaPlanId,
        ap.periodo_id AS periodoId,
        ap.orden_visualizacion AS ordenVisualizacion,
        m.nombre AS materiaNombre,
        m.sigla AS materiaSigla
      ${baseFrom}
      ORDER BY ap.orden_visualizacion ASC, oc.id ASC
      LIMIT :limit OFFSET :offset
      `,
      { replacements: { parallelManagementId: pgId, limit, offset }, type: QueryTypes.SELECT }
    );

    return { rows, total };
  }

  /**
   * Catálogo paginado de oferta_cursos de un plan habilitado (todos los paralelos_gestion).
   */
  async findCatalogByManagementPlanId(managementPlanId, opts = {}) {
    const gpId = Number(managementPlanId);
    if (!Number.isFinite(gpId) || gpId < 1) return { rows: [], total: 0 };

    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(opts.limit ?? 500), 10) || 500));
    const offset = (page - 1) * limit;

    const baseFrom = `
      FROM oferta_cursos oc
      INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
        AND pg.gestion_plan_id = :managementPlanId
      INNER JOIN asignaturas_plan ap
        ON ap.id = oc.asignatura_plan_id
        AND ap.deleted_at IS NULL
        AND ap.activo = TRUE
      LEFT JOIN materias m
        ON m.id = ap.materia_id
        AND m.deleted_at IS NULL
      WHERE oc.deleted_at IS NULL
        AND oc.activo = TRUE
    `;

    const countRows = await sequelize.query(
      `SELECT COUNT(*) AS total ${baseFrom}`,
      { replacements: { managementPlanId: gpId }, type: QueryTypes.SELECT }
    );
    const total = Number(countRows[0]?.total ?? countRows[0]?.TOTAL ?? 0) || 0;

    const rows = await sequelize.query(
      `
      SELECT
        oc.id AS id,
        CONCAT('OC-', oc.id) AS codigo,
        pg.paralelo_id AS paraleloId,
        oc.asignatura_plan_id AS asignaturaPlanId,
        ap.periodo_id AS periodoId,
        ap.orden_visualizacion AS ordenVisualizacion,
        m.nombre AS materiaNombre,
        m.sigla AS materiaSigla
      ${baseFrom}
      ORDER BY ap.orden_visualizacion ASC, oc.id ASC
      LIMIT :limit OFFSET :offset
      `,
      { replacements: { managementPlanId: gpId, limit, offset }, type: QueryTypes.SELECT }
    );

    return { rows, total };
  }

  /**
   * Cobertura docente de un paralelo_gestion (ofertas activas vs asignación vigente).
   */
  async findCoberturaDocenteByParallelManagementId(parallelManagementId) {
    const pgId = Number(parallelManagementId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      return { cursosTotal: 0, cursosConDocente: 0, faltantes: [] };
    }

    const rows = await sequelize.query(
      `
      SELECT
        oc.id AS oferta_curso_id,
        m.sigla AS asignatura,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM asignaciones_docentes ad
            WHERE ad.oferta_curso_id = oc.id
              AND ad.deleted_at IS NULL
              AND ad.activo = TRUE
              AND ad.vigente = TRUE
              AND ad.docente_id IS NOT NULL
          ) THEN 1
          ELSE 0
        END AS tiene_docente
      FROM oferta_cursos oc
      INNER JOIN asignaturas_plan ap
        ON ap.id = oc.asignatura_plan_id
        AND ap.deleted_at IS NULL
        AND ap.activo = TRUE
      LEFT JOIN materias m
        ON m.id = ap.materia_id
        AND m.deleted_at IS NULL
      WHERE oc.paralelo_gestion_id = :parallelManagementId
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
      ORDER BY ap.orden_visualizacion ASC, oc.id ASC
      `,
      { replacements: { parallelManagementId: pgId }, type: QueryTypes.SELECT }
    );

    const cursosTotal = rows.length;
    const faltantes = rows
      .filter((r) => Number(r.tiene_docente) !== 1)
      .map((r) => ({
        ofertaCursoId: Number(r.oferta_curso_id),
        asignatura: r.asignatura ?? '',
      }));
    const cursosConDocente = cursosTotal - faltantes.length;

    return { cursosTotal, cursosConDocente, faltantes };
  }

  /**
   * Totales de cobertura docente en toda una gestión (todas las ofertas activas).
   */
  async findCoberturaTotalesByGestionId(gestionId) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      return { cursosTotal: 0, cursosConDocente: 0 };
    }

    const rows = await sequelize.query(
      `
      SELECT
        COUNT(*) AS cursos_total,
        SUM(
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM asignaciones_docentes ad
              WHERE ad.oferta_curso_id = oc.id
                AND ad.deleted_at IS NULL
                AND ad.activo = TRUE
                AND ad.vigente = TRUE
                AND ad.docente_id IS NOT NULL
            ) THEN 1
            ELSE 0
          END
        ) AS cursos_con_docente
      FROM oferta_cursos oc
      INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
      INNER JOIN gestiones_planes gp
        ON gp.id = pg.gestion_plan_id
        AND gp.deleted_at IS NULL
        AND gp.activo = TRUE
        AND gp.gestion_id = :gestionId
      WHERE oc.deleted_at IS NULL
        AND oc.activo = TRUE
      `,
      { replacements: { gestionId: gId }, type: QueryTypes.SELECT }
    );

    const row = rows[0] ?? {};
    return {
      cursosTotal: Number(row.cursos_total ?? row.CURSOS_TOTAL ?? 0) || 0,
      cursosConDocente: Number(row.cursos_con_docente ?? row.CURSOS_CON_DOCENTE ?? 0) || 0,
    };
  }
}
