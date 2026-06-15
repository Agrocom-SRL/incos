import { PlanSubjectMapper } from '../../mappers/configuracion/index.js';

export class ListAsignaturasPlanByPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(planEstudioId) {
    const result = await this.planSubjectRepository.findAll({ studyPlanId: planEstudioId }, null, null);
    const asignaturas = PlanSubjectMapper.entitiesToPresentation(result.planSubjects ?? []);
    return { asignaturas };
  }
}

