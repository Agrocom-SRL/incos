import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteAsignaturaPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.planSubjectRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('asignatura_plan');
    return true;
  }
}

