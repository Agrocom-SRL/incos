import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteEstadoCivilUseCase {
  constructor({ civilStatusRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.civilStatusRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('estado civil');
    this.logger.info('Estado civil eliminado', { id });
    return true;
  }
}
