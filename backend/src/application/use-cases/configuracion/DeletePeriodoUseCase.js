import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeletePeriodoUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.periodRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('periodo');
    return true;
  }
}
