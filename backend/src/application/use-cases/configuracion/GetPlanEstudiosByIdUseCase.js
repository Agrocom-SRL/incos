import { StudyPlanMapper, PeriodMapper, PlanSubjectMapper, PrerequisiteMapper } from '../../mappers/configuracion/index.js';

export class GetPlanEstudiosByIdUseCase {
  constructor({ studyPlanRepository, periodRepository, planSubjectRepository, prerequisiteRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(id) {
    const plan = await this.studyPlanRepository.findById(id);
    if (!plan) return null;

    const periodosResult = await this.periodRepository.findAll({ studyPlanId: id }, null, null);
    const asignaturasResult = await this.planSubjectRepository.findAll({ studyPlanId: id }, null, null);
    const prerrequisitosResult = await this.prerequisiteRepository.findAll({ studyPlanId: id }, null, null);

    return {
      plan_estudio: StudyPlanMapper.entityToPresentation(plan),
      periodos: PeriodMapper.entitiesToPresentation(periodosResult.periods ?? []),
      asignaturas: PlanSubjectMapper.entitiesToPresentation(asignaturasResult.planSubjects ?? []),
      prerrequisitos: PrerequisiteMapper.entitiesToPresentation(prerrequisitosResult.prerequisites ?? []),
    };
  }
}

