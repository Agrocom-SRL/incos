import { ActivityMapper } from '../../mappers/configuracion/index.js';

export class GetActividadByIdUseCase {
  constructor({ activityRepository, logger }) {
    this.activityRepository = activityRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.activityRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return ActivityMapper.entityToPresentation(entity);
  }
}
