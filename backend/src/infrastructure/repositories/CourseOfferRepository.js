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
        m.codigo AS materiaCodigo
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
        m.codigo AS materiaCodigo
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
        m.codigo AS materiaCodigo
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
}
