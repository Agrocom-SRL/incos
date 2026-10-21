import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_OFERTA_CURSO,
  ESTADOS_PARALELO_GESTION,
} from '../../../domain/constants/oferta.constants.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
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
    const pgRaw = paralelo_gestion_id ?? paraleloGestionId;
    const apRaw = asignatura_plan_id ?? asignaturaPlanId;

    if (pgRaw == null || pgRaw === '' || apRaw == null || apRaw === '') {
      throw new ValidationError('paralelo_gestion_id y asignatura_plan_id son requeridos');
    }
    const pgId = parseIdPositivo(pgRaw, 'paralelo_gestion_id');
    const apId = parseIdPositivo(apRaw, 'asignatura_plan_id');

    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) throw new NotFoundError('paralelo de gestión');

    if ((pg.state ?? pg.estado) === ESTADOS_PARALELO_GESTION.CERRADO) {
      throw new ValidationError('No se puede agregar oferta a un paralelo CERRADO');
    }

    const asignatura = await this.planSubjectRepository.findById(apId);
    if (!asignatura) throw new NotFoundError('asignatura del plan');

    // La asignatura debe ser del plan y del periodo del paralelo.
    const ctx = await this.parallelManagementRepository.findGenerationContext(pgId);
    if (ctx) {
      const asigPlain = asignatura.toPlainObject ? asignatura.toPlainObject() : asignatura;
      if (
        Number(asigPlain.studyPlanId) !== Number(ctx.studyPlanId) ||
        Number(asigPlain.periodId) !== Number(ctx.periodId)
      ) {
        throw new ValidationError(
          'La asignatura no pertenece al plan de estudios y periodo de este paralelo'
        );
      }
    }

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
