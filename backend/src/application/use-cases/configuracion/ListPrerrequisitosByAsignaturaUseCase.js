import { PrerequisiteMapper } from '../../mappers/configuracion/index.js';

export class ListPrerrequisitosByAsignaturaUseCase {
  constructor({ prerequisiteRepository, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(asignaturaPlanId) {
    const result = await this.prerequisiteRepository.findAll({ subjectId: asignaturaPlanId }, null, null);
    const prerrequisitos = PrerequisiteMapper.entitiesToPresentation(result.prerequisites ?? []);
    return { prerrequisitos };
  }
}

