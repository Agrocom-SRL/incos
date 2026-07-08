import { LanguageMapper } from '../../mappers/referencia/index.js';

export class GetIdiomaByIdUseCase {
  constructor({ languageRepository, logger }) {
    this.languageRepository = languageRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.languageRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return LanguageMapper.entityToPresentation(entity);
  }
}
