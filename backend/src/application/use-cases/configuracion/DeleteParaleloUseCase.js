import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

export class DeleteParaleloUseCase {
  constructor({ parallelRepository, parallelManagementRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const current = await this.parallelRepository.findById(id);
    if (!current) {
      throw new NotFoundError('paralelo');
    }

    const refs = await this.parallelManagementRepository.count({ parallelId: id });
    if (refs > 0) {
      throw new ValidationError(
        'No se puede eliminar: el paralelo está referenciado en al menos una gestión académica'
      );
    }

    const ok = await this.parallelRepository.delete(id, userId);
    if (!ok) {
      throw new NotFoundError('paralelo');
    }

    this.logger.info('[CFG] Paralelo maestro eliminado', { id });
    return true;
  }
}
