/**
 * GET /api/v1/docentes/cursos-disponibles — cursos del plan de estudios del plan habilitado.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class ListCursosDisponiblesDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {import('../../../infrastructure/repositories/CourseRepository.js').CourseRepository} deps.courseRepository
   * @param {Object} deps.logger
   */
  constructor({ managementPlanRepository, courseRepository, logger }) {
    this.managementPlanRepository = managementPlanRepository;
    this.courseRepository = courseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.gestionPlanId
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ gestionPlanId, page = 1, limit = 500 } = {}) {
    const gpId = Number(gestionPlanId);
    if (!Number.isFinite(gpId) || gpId < 1) {
      throw new NotFoundError('Plan habilitado');
    }

    this.logger.info('[Docentes] Listar cursos disponibles (asignación)', { gestionPlanId: gpId, page, limit });

    const plan = await this.managementPlanRepository.findById(gpId);
    if (!plan) {
      throw new NotFoundError('Plan habilitado');
    }

    const studyPlanId = plan.studyPlanId;
    if (studyPlanId == null || !Number.isFinite(Number(studyPlanId))) {
      return { cursos: [], total: 0, page: 1, limit: 500, totalPages: 0 };
    }

    const { rows, total } = await this.courseRepository.findCursosByStudyPlanIdForCatalog(Number(studyPlanId), {
      page,
      limit,
    });
    const limitNum = Math.min(10000, Math.max(1, parseInt(String(limit), 10) || 500));
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const totalPages = Math.ceil(total / limitNum) || 0;

    return {
      cursos: rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
