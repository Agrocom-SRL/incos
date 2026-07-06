import { DocumentacionMapper } from '../../mappers/referencia/index.js';

export class GetDocumentacionByIdUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.documentacionRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return DocumentacionMapper.entityToPresentation(entity);
  }
}
