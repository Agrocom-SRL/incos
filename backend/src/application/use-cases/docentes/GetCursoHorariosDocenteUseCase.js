/**
 * GET /api/v1/docentes/cursos/:cursoId/horarios — bloques de horario + aula de una oferta.
 * Nota: cursoId en la ruta es oferta_curso_id (compatibilidad UI legacy).
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class GetCursoHorariosDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/CourseOfferRepository.js').CourseOfferRepository} deps.courseOfferRepository
   * @param {import('../../../infrastructure/repositories/CourseScheduleRepository.js').CourseScheduleRepository} deps.courseScheduleRepository
   * @param {Object} deps.logger
   */
  constructor({ courseOfferRepository, courseScheduleRepository, logger }) {
    this.courseOfferRepository = courseOfferRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.logger = logger;
  }

  async execute(ofertaCursoId) {
    const id = Number(ofertaCursoId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Oferta de curso');
    }

    this.logger.info('[Docentes] Horarios de oferta (asignación)', { ofertaCursoId: id });

    const offer = await this.courseOfferRepository.findById(id);
    if (!offer) {
      throw new NotFoundError('Oferta de curso');
    }

    const bloques = await this.courseScheduleRepository.findBloquesByCursoIdForPresentation(id);
    const plain = offer.toPlainObject ? offer.toPlainObject() : offer;

    return {
      bloques,
      cursoId: id,
      ofertaCursoId: id,
      cursoCodigo: plain.code ?? `OC-${id}`,
      cursoColorHex: plain.colorHex ?? null,
    };
  }
}
