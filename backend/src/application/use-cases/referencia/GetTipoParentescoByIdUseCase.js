import { RelationshipTypeMapper } from '../../mappers/referencia/index.js';

export class GetTipoParentescoByIdUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.relationshipTypeRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return RelationshipTypeMapper.entityToPresentation(entity);
  }
}
