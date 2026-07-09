import { RelationshipTypeMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class GetTipoParentescoByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.relationshipTypeRepository - Repositorio de tipos de parentesco
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ relationshipTypeRepository, complementariosUsosViewRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.relationshipTypeRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    const presentation = RelationshipTypeMapper.entityToPresentation(entity);

    // Enriquece con los conteos de uso del catálogo (vista 151), 0 por defecto
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('PARENTESCO');
    const [enriched] = mergeUsosComplementarios([presentation], usos);
    return enriched;
  }
}
