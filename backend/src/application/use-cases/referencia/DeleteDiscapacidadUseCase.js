import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteDiscapacidadUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.disabilityTypeRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('tipo de discapacidad');
    this.logger.info('Tipo de discapacidad eliminado', { id });
    return true;
  }
}
