/**
 * GET /api/v1/docentes/paralelos-disponibles — paralelos de la carrera del plan en el periodo elegido.
 */

import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';

function paraleloToRow(entity) {
  const o = entity?.toPlainObject?.() ?? entity ?? {};
  return {
    id: o.id,
    nombre: o.name ?? o.nombre,
    turno: o.shift ?? o.turno,
    descripcion: o.description ?? o.descripcion,
    carreraId: o.careerId ?? o.carreraId,
    periodoId: o.periodId ?? o.periodoId,
  };
}

export class ListParalelosDocenteAsignacionUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {import('../../../infrastructure/repositories/StudyPlanRepository.js').StudyPlanRepository} deps.studyPlanRepository
   * @param {import('../../../infrastructure/repositories/PeriodRepository.js').PeriodRepository} deps.periodRepository
   * @param {import('../../../infrastructure/repositories/ParallelRepository.js').ParallelRepository} deps.parallelRepository
   * @param {Object} deps.logger
   */
  constructor({
    managementPlanRepository,
    studyPlanRepository,
    periodRepository,
    parallelRepository,
    logger,
  }) {
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.periodRepository = periodRepository;
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.gestionPlanId
   * @param {number} params.periodoId
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ gestionPlanId, periodoId, page = 1, limit = 200 } = {}) {
    const gpId = Number(gestionPlanId);
    const perId = Number(periodoId);
    if (!Number.isFinite(gpId) || gpId < 1) {
      throw new NotFoundError('Plan habilitado');
    }
    if (!Number.isFinite(perId) || perId < 1) {
      throw new UnprocessableEntityError('periodoId es requerido y debe ser un entero positivo.', [
        { field: 'periodoId', message: 'Inválido' },
      ]);
    }

    this.logger.info('[Docentes] Listar paralelos (asignación)', { gestionPlanId: gpId, periodoId: perId, page, limit });

    const managementPlan = await this.managementPlanRepository.findById(gpId);
    if (!managementPlan) {
      throw new NotFoundError('Plan habilitado');
    }

    const studyPlanId = managementPlan.studyPlanId;
    if (studyPlanId == null || !Number.isFinite(Number(studyPlanId))) {
      return { paralelos: [], total: 0, page: 1, limit: 200, totalPages: 0 };
    }

    const periodEntity = await this.periodRepository.findById(perId);
    if (!periodEntity) {
      throw new NotFoundError('Periodo');
    }
    const periodPlanId = periodEntity.studyPlanId ?? null;
    if (periodPlanId == null || Number(periodPlanId) !== Number(studyPlanId)) {
      throw new UnprocessableEntityError('El periodo no pertenece al plan de estudios del plan habilitado.', [
        { field: 'periodoId', message: 'Incoherente con gestionPlanId' },
      ]);
    }

    const studyPlan = await this.studyPlanRepository.findById(Number(studyPlanId));
    if (!studyPlan) {
      throw new NotFoundError('Plan de estudios');
    }

    const careerId = studyPlan.careerId ?? null;
    if (careerId == null || !Number.isFinite(Number(careerId))) {
      return { paralelos: [], total: 0, page: 1, limit: 200, totalPages: 0 };
    }

    const result = await this.parallelRepository.findAll(
      { careerId: Number(careerId), periodId: perId, sort: 'nombre:ASC' },
      page,
      limit
    );
    const raw = result.parallels ?? [];
    const total = Number(result.total ?? 0) || 0;
    const limitNum = Math.min(10000, Math.max(1, parseInt(String(limit), 10) || 200));
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const totalPages = Math.ceil(total / limitNum) || 0;

    const managementId = Number(managementPlan.managementId);
    const parallelIds = raw
      .map((e) => {
        const o = e?.toPlainObject?.() ?? e ?? {};
        const id = Number(o.id);
        return Number.isFinite(id) && id > 0 ? id : null;
      })
      .filter((id) => id != null);

    let statsByParaleloId = new Map();
    if (Number.isFinite(managementId) && managementId > 0 && parallelIds.length > 0) {
      const statsRows = await this.parallelRepository.obtenerEstadisticasYPeriodoPorGestion(
        parallelIds,
        managementId
      );
      statsByParaleloId = new Map(
        (statsRows || []).map((row) => {
          const pid = Number(row.paralelo_id ?? row.PARALELO_ID);
          return [
            pid,
            {
              totalInscritos: Number(row.total_inscritos ?? row.TOTAL_INSCRITOS) || 0,
              totalHombres: Number(row.total_hombres ?? row.TOTAL_HOMBRES) || 0,
              totalMujeres: Number(row.total_mujeres ?? row.TOTAL_MUJERES) || 0,
            },
          ];
        })
      );
    }

    const paralelos = raw.map((entity) => {
      const row = paraleloToRow(entity);
      const sid = Number(row.id);
      const estadisticas = statsByParaleloId.get(sid) ?? {
        totalInscritos: 0,
        totalHombres: 0,
        totalMujeres: 0,
      };
      return { ...row, estadisticas };
    });

    return {
      paralelos,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
