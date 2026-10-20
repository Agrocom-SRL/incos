import { QueryTypes } from 'sequelize';
import { ParaleloGestion as ParaleloGestionModel } from '../database/models/paralelo_gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelManagementMapper } from '../mappers/ParallelManagementMapper.js';
import { sequelize } from '../database/sequelize.js';
import { ParaleloGestionFichaViewRepository } from './views/ParaleloGestionFichaViewRepository.js';

/**
 * Paralelos en gestión (paralelos_gestion): CRUD heredado de BaseRepository más
 * lecturas enriquecidas (vista 127, vía fichaViewRepository) y contexto de
 * generación de oferta.
 * @implements {IParaleloGestionRepository}
 */
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

  mapDataToModel(data, _userId = null) {
    return ParallelManagementMapper.toModel(data);
  }

  mapDataToUpdate(data, _userId = null) {
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
   *
   * El paralelo maestro es reutilizable por carrera (un solo `periodo_id`
   * fijo), pero una carrera puede tener más de un plan de estudios activo a
   * la vez, cada uno con SUS PROPIOS periodos (mismo "1er/2do/3er año", ids
   * distintos). Por eso el periodo no se toma tal cual del maestro: se
   * resuelve el periodo del PLAN de esta gestión-plan que tenga el mismo
   * número de año — así "PRIMERO B" sigue siendo un solo maestro reutilizado
   * entre RM 2025 y RM 2027 sin duplicarlo. Si el maestro ya pertenece al
   * mismo plan de la gestión, resuelve al mismo periodo de siempre (no-op).
   */
  async findGenerationContext(parallelManagementId) {
    const rows = await sequelize.query(
      `
      SELECT
        pg.id AS parallelManagementId,
        pg.gestion_plan_id AS managementPlanId,
        gp.plan_estudio_id AS studyPlanId,
        pg.paralelo_id AS parallelId,
        per_destino.id AS periodId
      FROM paralelos_gestion pg
      INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id AND gp.deleted_at IS NULL
      INNER JOIN paralelos p ON p.id = pg.paralelo_id AND p.deleted_at IS NULL
      INNER JOIN periodos per_origen ON per_origen.id = p.periodo_id AND per_origen.deleted_at IS NULL
      LEFT JOIN periodos per_destino
        ON per_destino.plan_estudio_id = gp.plan_estudio_id
        AND per_destino.numero = per_origen.numero
        AND per_destino.deleted_at IS NULL
        AND per_destino.activo = TRUE
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
