import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteTipoParentescoUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.relationshipTypeRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('tipo de parentesco');
    this.logger.info('Tipo de parentesco eliminado', { id });
    return true;
  }
}
