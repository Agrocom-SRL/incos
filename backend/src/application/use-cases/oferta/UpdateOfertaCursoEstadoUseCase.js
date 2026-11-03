import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_OFERTA_CURSO_VALUES,
  TRANSICIONES_OFERTA_CURSO,
} from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/CourseOfferPresentationMapper.js';

export class UpdateOfertaCursoEstadoUseCase {
  constructor({ courseOfferRepository, logger }) {
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute(id, { estado }, userId = null) {
    if (!estado || !ESTADOS_OFERTA_CURSO_VALUES.includes(estado)) {
      throw new ValidationError('estado inválido para oferta de curso');
    }

    const offer = await this.courseOfferRepository.findById(id);
    if (!offer) throw new NotFoundError('oferta de curso');

    const actual = offer.state ?? offer.estado ?? null;
    if (actual !== null && actual !== estado) {
      const permitidos = TRANSICIONES_OFERTA_CURSO[actual] ?? [];
      if (!permitidos.includes(estado)) {
        throw new ValidationError(
          `Transición no permitida: una oferta ${actual} no puede pasar a ${estado}`,
          { estadoActual: actual, estadoSolicitado: estado, permitidos }
        );
      }
    }

    const updated = await this.courseOfferRepository.update(id, { state: estado }, userId);
    return { ofertaCurso: entityToPresentation(updated) };
  }
}
