import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteTipoEvaluacionUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.evaluationTypeRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('tipo de evaluación');
    this.logger.info('Tipo de evaluación eliminado', { id });
    return true;
  }
}
