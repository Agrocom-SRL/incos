import { LanguageMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class GetIdiomaByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ languageRepository, complementariosUsosViewRepository, logger }) {
    this.languageRepository = languageRepository;
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.languageRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    const presentation = LanguageMapper.entityToPresentation(entity);

    // Enriquece con los conteos de uso del catálogo (vista 151), 0 por defecto
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('IDIOMA');
    const [enriched] = mergeUsosComplementarios([presentation], usos);
    return enriched;
  }
}
