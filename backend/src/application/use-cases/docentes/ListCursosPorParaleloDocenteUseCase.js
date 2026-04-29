/**
 * GET /api/v1/docentes/cursos-por-paralelo — cursos (oferta) de un paralelo para asignación docente.
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class ListCursosPorParaleloDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ParallelRepository.js').ParallelRepository} deps.parallelRepository
   * @param {import('../../../infrastructure/repositories/CourseRepository.js').CourseRepository} deps.courseRepository
   * @param {Object} deps.logger
   */
  constructor({ parallelRepository, courseRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloId
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ paraleloId, page = 1, limit = 500 } = {}) {
    const pid = Number(paraleloId);
    if (!Number.isFinite(pid) || pid < 1) {
      throw new NotFoundError('Paralelo');
    }

    this.logger.info('[Docentes] Listar cursos por paralelo (asignación)', { paraleloId: pid, page, limit });

    const paralelo = await this.parallelRepository.findById(pid);
    if (!paralelo) {
      throw new NotFoundError('Paralelo');
    }

    const { rows, total } = await this.courseRepository.findCursosByParaleloIdForCatalog(pid, { page, limit });
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
