import { PlanSubjectMapper } from '../../mappers/configuracion/index.js';

export class ListAsignaturasPlanByPeriodoUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(periodoId) {
    const result = await this.planSubjectRepository.findAll({ periodId: periodoId }, null, null);
    const asignaturas = PlanSubjectMapper.entitiesToPresentation(result.planSubjects ?? []);
    return { asignaturas };
  }
}
