import { DisabilityTypeMapper } from '../../mappers/referencia/index.js';

export class GetDiscapacidadByIdUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.disabilityTypeRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return DisabilityTypeMapper.entityToPresentation(entity);
  }
}
