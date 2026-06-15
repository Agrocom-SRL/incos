/**
 * GET /api/v1/paralelos-gestion/:id/cobertura-docente
 */

import { NotFoundError } from '../../../domain/errors/index.js';
import { ParaleloGestionCoberturaDocenteMapper } from '../../mappers/oferta/ParaleloGestionCoberturaDocenteMapper.js';

export class GetParaleloGestionCoberturaDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ParallelManagementRepository.js').ParallelManagementRepository} deps.parallelManagementRepository
   * @param {import('../../../infrastructure/repositories/CourseOfferRepository.js').CourseOfferRepository} deps.courseOfferRepository
   * @param {import('../../../domain/interfaces/ILogger.js').ILogger} deps.logger
   */
  constructor({ parallelManagementRepository, courseOfferRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  /**
   * @param {number} paraleloGestionId
   */
  async execute(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo en gestión');
    }

    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) {
      throw new NotFoundError('Paralelo en gestión', pgId);
    }

    const cobertura = await this.courseOfferRepository.findCoberturaDocenteByParallelManagementId(pgId);

    this.logger.info('[Oferta] Cobertura docente paralelo_gestion', {
      paraleloGestionId: pgId,
      cursosTotal: cobertura.cursosTotal,
      cursosConDocente: cobertura.cursosConDocente,
    });

    return ParaleloGestionCoberturaDocenteMapper.toPresentation({
      paraleloGestionId: pgId,
      ...cobertura,
    });
  }
}
