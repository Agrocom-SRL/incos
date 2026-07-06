import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteIdiomaUseCase {
  constructor({ languageRepository, logger }) {
    this.languageRepository = languageRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.languageRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('idioma');
    this.logger.info('Idioma eliminado', { id });
    return true;
  }
}
