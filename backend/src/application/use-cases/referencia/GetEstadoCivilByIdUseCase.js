import { CivilStatusMapper } from '../../mappers/referencia/index.js';

export class GetEstadoCivilByIdUseCase {
  constructor({ civilStatusRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.civilStatusRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return CivilStatusMapper.entityToPresentation(entity);
  }
}
