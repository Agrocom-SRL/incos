import { NotFoundError } from '../../../domain/errors/AppError.js';
import { DocumentacionMapper } from '../../mappers/referencia/index.js';

export class GetDocumentacionByIdUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.documentacionRepository.findById(id, { paranoid: false });
    if (!entity) throw new NotFoundError('tipo de documentación');

    return DocumentacionMapper.entityToPresentation(entity);
  }
}
