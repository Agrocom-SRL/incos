import { NotFoundError } from '../../../domain/errors/AppError.js';
import { DisabilityTypeMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class GetDiscapacidadByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.disabilityTypeRepository - Repositorio de tipos de discapacidad
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ disabilityTypeRepository, complementariosUsosViewRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.disabilityTypeRepository.findById(id, { paranoid: false });
    if (!entity) throw new NotFoundError('tipo de discapacidad');

    const presentation = DisabilityTypeMapper.entityToPresentation(entity);

    // Enriquece con los conteos de uso del catálogo (vista 151), 0 por defecto
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('DISCAPACIDAD');
    const [enriched] = mergeUsosComplementarios([presentation], usos);
    return enriched;
  }
}
