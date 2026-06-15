import { PeriodMapper } from '../../mappers/configuracion/index.js';

export class ListPeriodosByPlanUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(planEstudioId) {
    const result = await this.periodRepository.findAll(
      { studyPlanId: planEstudioId, sort: 'numero:ASC' },
      null,
      null
    );
    const periodos = PeriodMapper.entitiesToPresentation(result.periods ?? []);
    return { periodos };
  }
}

