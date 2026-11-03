import { NotFoundError } from '../../../domain/errors/AppError.js';
import { CivilStatusMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class GetEstadoCivilByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ civilStatusRepository, complementariosUsosViewRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.civilStatusRepository.findById(id, { paranoid: false });
    if (!entity) throw new NotFoundError('estado civil');

    const presentation = CivilStatusMapper.entityToPresentation(entity);

    // Enriquece con los conteos de uso del catálogo (vista 151), 0 por defecto
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('ESTADO_CIVIL');
    const [enriched] = mergeUsosComplementarios([presentation], usos);
    return enriched;
  }
}
