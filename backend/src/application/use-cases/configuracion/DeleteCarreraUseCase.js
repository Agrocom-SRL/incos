import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteCarreraUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.careerRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('carrera');
    this.logger.info('Carrera eliminada', { id });
    return true;
  }
}
