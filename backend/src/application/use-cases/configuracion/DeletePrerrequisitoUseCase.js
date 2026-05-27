import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeletePrerrequisitoUseCase {
  constructor({ prerequisiteRepository, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.prerequisiteRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('prerrequisito');
    return true;
  }
}

