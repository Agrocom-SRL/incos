import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteAulaUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.classroomRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('aula');
    this.logger.info('Aula eliminada', { id });
    return true;
  }
}
