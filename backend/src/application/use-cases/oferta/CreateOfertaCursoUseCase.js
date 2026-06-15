import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_OFERTA_CURSO } from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/CourseOfferPresentationMapper.js';

export class CreateOfertaCursoUseCase {
  constructor({
    parallelManagementRepository,
    planSubjectRepository,
    courseOfferRepository,
    logger,
  }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute({ paralelo_gestion_id, paraleloGestionId, asignatura_plan_id, asignaturaPlanId }, userId = null) {
    const pgId = paralelo_gestion_id ?? paraleloGestionId;
    const apId = asignatura_plan_id ?? asignaturaPlanId;

    if (!pgId || !apId) {
      throw new ValidationError('paralelo_gestion_id y asignatura_plan_id son requeridos');
    }

    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) throw new NotFoundError('paralelo de gestión');

    const asignatura = await this.planSubjectRepository.findById(apId);
    if (!asignatura) throw new NotFoundError('asignatura del plan');

    const dup = await this.courseOfferRepository.findBy({
      parallelManagementId: pgId,
      planSubjectId: apId,
    });
    if (dup) {
      throw new ValidationError('La asignatura ya está en la oferta de este paralelo');
    }

    const created = await this.courseOfferRepository.create(
      {
        parallelManagementId: pgId,
        planSubjectId: apId,
        state: ESTADOS_OFERTA_CURSO.PROGRAMADA,
      },
      userId
    );

    return { ofertaCurso: entityToPresentation(created) };
  }
}
