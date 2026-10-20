import { PrerequisiteMapper } from '../../mappers/configuracion/index.js';

export class ListEsPrerrequisitoDeUseCase {
  constructor({ prerequisiteRepository, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(asignaturaPlanId) {
    const result = await this.prerequisiteRepository.findAll({ prerequisiteId: asignaturaPlanId }, null, null);
    const es_prerrequisito_de = PrerequisiteMapper.entitiesToPresentation(result.prerequisites ?? []);
    return { es_prerrequisito_de };
  }
}
