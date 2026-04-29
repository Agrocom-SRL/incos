/**
 * GET /api/v1/docentes/periodos-disponibles — periodos (años del plan) del plan de estudios del plan habilitado.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

function periodToRow(entity) {
  const o = entity?.toPlainObject?.() ?? entity ?? {};
  return {
    id: o.id,
    nombre: o.name ?? o.nombre,
    numero: o.number ?? o.numero,
    ordenVisualizacion: o.displayOrder ?? o.ordenVisualizacion,
    planEstudioId: o.studyPlanId ?? o.planEstudioId,
  };
}

export class ListPeriodosDocenteAsignacionUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {import('../../../infrastructure/repositories/PeriodRepository.js').PeriodRepository} deps.periodRepository
   * @param {Object} deps.logger
   */
  constructor({ managementPlanRepository, periodRepository, logger }) {
    this.managementPlanRepository = managementPlanRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.gestionPlanId
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ gestionPlanId, page = 1, limit = 100 } = {}) {
    const gpId = Number(gestionPlanId);
    if (!Number.isFinite(gpId) || gpId < 1) {
      throw new NotFoundError('Plan habilitado');
    }

    this.logger.info('[Docentes] Listar periodos (asignación)', { gestionPlanId: gpId, page, limit });

    const plan = await this.managementPlanRepository.findById(gpId);
    if (!plan) {
      throw new NotFoundError('Plan habilitado');
    }

    const studyPlanId = plan.studyPlanId;
    if (studyPlanId == null || !Number.isFinite(Number(studyPlanId))) {
      return { periodos: [], total: 0, page: 1, limit: 100, totalPages: 0 };
    }

    const result = await this.periodRepository.findAll(
      { studyPlanId: Number(studyPlanId), sort: 'ordenVisualizacion:ASC' },
      page,
      limit
    );
    const raw = result.periods ?? [];
    const total = Number(result.total ?? 0) || 0;
    const limitNum = Math.min(10000, Math.max(1, parseInt(String(limit), 10) || 100));
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const totalPages = Math.ceil(total / limitNum) || 0;

    return {
      periodos: raw.map(periodToRow),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
