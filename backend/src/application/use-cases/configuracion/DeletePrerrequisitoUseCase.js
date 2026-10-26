import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

export class DeletePrerrequisitoUseCase {
  constructor({ prerequisiteRepository, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.prerequisiteRepository.delete(parseIdPositivo(id, 'id'), userId);
    if (!ok) throw new NotFoundError('prerrequisito');
    this.logger?.info('Prerrequisito eliminado', { id });
    return true;
  }
}
