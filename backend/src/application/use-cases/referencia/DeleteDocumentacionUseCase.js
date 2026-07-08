import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeleteDocumentacionUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.documentacionRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('tipo de documentación');
    this.logger.info('Tipo de documentación eliminado', { id });
    return true;
  }
}
