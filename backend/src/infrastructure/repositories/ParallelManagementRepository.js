import { QueryTypes } from 'sequelize';
import { ParaleloGestion as ParaleloGestionModel } from '../database/models/paralelo_gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelManagementMapper } from '../mappers/ParallelManagementMapper.js';
import { sequelize } from '../database/sequelize.js';
import { ParaleloGestionFichaViewRepository } from './views/ParaleloGestionFichaViewRepository.js';

export class ParallelManagementRepository extends BaseRepository {
  constructor({ fichaViewRepository } = {}) {
    super();
    this.fichaViewRepository =
      fichaViewRepository ?? new ParaleloGestionFichaViewRepository();
  }

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
   * Lista enriquecida por plan habilitado (vista 127).
   * @param {number} managementPlanId
   */
  findEnrichedByManagementPlanId(managementPlanId) {
    return this.fichaViewRepository.findByManagementPlanId(managementPlanId);
  }

  /**
   * Detalle enriquecido (vista 127).
   */
  findEnrichedById(id) {
    return this.fichaViewRepository.findById(id);
  }

  /**
   * Paralelos-gestión en OFERTADO de una gestión (vista 127).
   * @param {number} gestionId
   */
  findEnrichedOfertadoByGestionId(gestionId) {
    return this.fichaViewRepository.findOfertadoByGestionId(gestionId);
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

  /**
   * Instancias de paralelo en gestiones (vista 127).
   * @param {number} parallelId
   */
  findEnrichedByParallelId(parallelId) {
    return this.fichaViewRepository.findByParallelId(parallelId);
  }
}
