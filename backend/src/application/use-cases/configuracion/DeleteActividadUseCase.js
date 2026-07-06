import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteActividadUseCase {
  constructor({ activityRepository, logger }) {
    this.activityRepository = activityRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.activityRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('actividad');
    this.logger.info('Actividad eliminada', { id });
    return true;
  }
}
