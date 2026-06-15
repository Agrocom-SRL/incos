/**
 * GET /api/v1/docentes/cursos/:cursoId/horarios — bloques de una oferta (oferta_curso_id en la ruta).
 */

import { NotFoundError } from '../../../domain/errors/index.js';

export class GetCursoHorariosDocenteUseCase {
  constructor({ courseOfferRepository, asignacionHorarioRepository, logger }) {
    this.courseOfferRepository = courseOfferRepository;
    this.asignacionHorarioRepository = asignacionHorarioRepository;
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

    const bloques = await this.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation(id);
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
