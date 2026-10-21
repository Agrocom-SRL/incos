import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteMateriaUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.subjectRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('materia');
    this.logger.info('Materia eliminada', { id });
    return true;
  }
}
