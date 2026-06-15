import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_OFERTA_CURSO } from '../../../domain/constants/oferta.constants.js';
import { entitiesToPresentation } from '../../mappers/oferta/CourseOfferPresentationMapper.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

export class GenerarOfertaCursosUseCase {
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

  async execute(parallelManagementId, userId = null) {
    const ctx = await this.parallelManagementRepository.findGenerationContext(
      parallelManagementId
    );
    if (!ctx) throw new NotFoundError('paralelo de gestión');
    if (!ctx.studyPlanId || !ctx.periodId) {
      throw new ValidationError('No se pudo resolver el plan o el periodo del paralelo');
    }

    const asignaturas = await this.planSubjectRepository.findAll({
      studyPlanId: ctx.studyPlanId,
      periodId: ctx.periodId,
      pagina: 1,
      limite: 500,
    });
    const materias = asignaturas.planSubjects ?? [];
    if (!materias.length) {
      throw new ValidationError('No hay asignaturas del plan para el periodo del paralelo');
    }

    const existingIds = new Set(
      await this.parallelManagementRepository.findExistingPlanSubjectIds(parallelManagementId)
    );

    const created = [];
    await sequelize.transaction(async () => {
      for (const ap of materias) {
        if (existingIds.has(ap.id)) continue;
        const row = await this.courseOfferRepository.create(
          {
            parallelManagementId,
            planSubjectId: ap.id,
            state: ESTADOS_OFERTA_CURSO.PROGRAMADA,
          },
          userId
        );
        created.push(row);
        existingIds.add(ap.id);
      }
    });

    this.logger.info('[Oferta] Cursos generados para paralelo-gestión', {
      parallelManagementId,
      creados: created.length,
    });

    return {
      ofertaCursos: entitiesToPresentation(created),
      resumen: {
        creados: created.length,
        existentes: materias.length - created.length,
        totalEsperadas: materias.length,
      },
    };
  }
}
