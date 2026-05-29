/**
 * GET /api/v1/docentes/cursos-por-paralelo — oferta_cursos de un paralelo en gestión.
 */

import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';

export class ListCursosPorParaleloDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ParallelManagementRepository.js').ParallelManagementRepository} deps.parallelManagementRepository
   * @param {import('../../../infrastructure/repositories/CourseOfferRepository.js').CourseOfferRepository} deps.courseOfferRepository
   * @param {Object} deps.logger
   */
  constructor({ parallelManagementRepository, courseOfferRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloId — paralelo maestro
   * @param {number} params.gestionPlanId — plan habilitado
   * @param {number} [params.paraleloGestionId] — atajo directo
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ paraleloId, gestionPlanId, paraleloGestionId, page = 1, limit = 500 } = {}) {
    let pgId = Number(paraleloGestionId);

    if (!Number.isFinite(pgId) || pgId < 1) {
      const pid = Number(paraleloId);
      const gpId = Number(gestionPlanId);
      if (!Number.isFinite(pid) || pid < 1) {
        throw new NotFoundError('Paralelo');
      }
      if (!Number.isFinite(gpId) || gpId < 1) {
        throw new UnprocessableEntityError('gestionPlanId es requerido junto con paraleloId.', [
          { field: 'gestionPlanId', message: 'Requerido' },
        ]);
      }

      const pg = await this.parallelManagementRepository.findByParallelAndManagementPlan(pid, gpId);
      if (!pg) {
        throw new NotFoundError('Paralelo en gestión');
      }
      pgId = Number(pg.id);
    }

    this.logger.info('[Docentes] Listar oferta por paralelo (asignación)', {
      paraleloGestionId: pgId,
      page,
      limit,
    });

    const { rows, total } = await this.courseOfferRepository.findCatalogByParallelManagementId(pgId, {
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
